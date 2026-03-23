'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Chore, ChoreWithProfile, CreateChoreInput, UpdateChoreInput, ChoreStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { getCurrentFamilyId } from '../profiles/actions';
import { notifyChoreCompleted } from '@/lib/services/notifications';

function mapProfile(p: any) {
  return {
    id: p.id,
    familyId: p.familyId,
    userId: p.userId,
    name: p.name,
    avatarUrl: p.avatarUrl,
    role: p.role,
    pinCode: p.pinCode,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function mapChore(c: any): Chore {
  return {
    id: c.id,
    familyId: c.familyId,
    assignedToProfileId: c.assignedToProfileId,
    title: c.title,
    description: c.description,
    pointsValue: c.pointsValue,
    dueDate: c.dueDate,
    recurrenceRule: c.recurrenceRule,
    status: c.status,
    createdByProfileId: c.createdByProfileId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function getChores(): Promise<ChoreWithProfile[]> {
  const familyId = await getCurrentFamilyId();
  if (!familyId) {
    throw new Error('No family found');
  }

  const data = await prisma.chore.findMany({
    where: { familyId },
    include: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return data.map(chore => ({
    ...mapChore(chore),
    assignedTo: mapProfile(chore.assignedTo),
    createdBy: mapProfile(chore.createdBy),
  }));
}

export async function getChoresForKid(profileId: string): Promise<ChoreWithProfile[]> {
  const allChores = await getChores();
  return allChores.filter(chore => chore.assignedToProfileId === profileId);
}

export async function getPendingChores(): Promise<ChoreWithProfile[]> {
  const allChores = await getChores();
  return allChores.filter(chore => chore.status === 'pending_review' || chore.status === 'done');
}

export async function createChore(input: CreateChoreInput, createdByProfileId: string): Promise<Chore> {
  const familyId = await getCurrentFamilyId();
  if (!familyId) {
    throw new Error('No family found');
  }

  const data = await prisma.chore.create({
    data: {
      familyId,
      assignedToProfileId: input.assignedToProfileId,
      title: input.title,
      description: input.description || null,
      pointsValue: input.pointsValue,
      dueDate: input.dueDate || null,
      recurrenceRule: input.recurrenceRule || null,
      status: 'not_started',
      createdByProfileId,
    },
  });

  revalidatePath('/parent/chores');
  revalidatePath('/kid');

  return mapChore(data);
}

export async function updateChore(choreId: string, input: UpdateChoreInput): Promise<Chore> {
  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pointsValue !== undefined) updateData.pointsValue = input.pointsValue;
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
  if (input.recurrenceRule !== undefined) updateData.recurrenceRule = input.recurrenceRule;
  if (input.status !== undefined) updateData.status = input.status;

  const data = await prisma.chore.update({
    where: { id: choreId },
    data: updateData,
  });

  revalidatePath('/parent/chores');
  revalidatePath('/parent/dashboard');
  revalidatePath('/kid');

  return mapChore(data);
}

export async function updateChoreStatus(choreId: string, status: ChoreStatus): Promise<void> {
  const chore = await prisma.chore.findUnique({
    where: { id: choreId },
    include: { assignedTo: { select: { name: true } } },
  });

  await updateChore(choreId, { status });

  if ((status === 'done' || status === 'pending_review') && chore) {
    const parentProfiles = await prisma.profile.findMany({
      where: {
        familyId: chore.familyId,
        role: { in: ['owner', 'parent', 'helper'] },
        userId: { not: null },
      },
      select: { user: { select: { email: true } } },
    });

    const parentEmails = parentProfiles
      .map(p => p.user?.email)
      .filter((e): e is string => !!e);

    if (parentEmails.length > 0) {
      await notifyChoreCompleted(parentEmails, chore.assignedTo.name, chore.title);
    }
  }
}

export async function approveChore(choreId: string, approvedByProfileId: string): Promise<void> {
  const chore = await prisma.chore.findUnique({ where: { id: choreId } });
  if (!chore) {
    throw new Error('Chore not found');
  }

  await updateChore(choreId, { status: 'completed' });

  await prisma.pointsTransaction.create({
    data: {
      profileId: chore.assignedToProfileId,
      amount: chore.pointsValue,
      reason: 'chore_completion',
      relatedChoreId: choreId,
      createdByProfileId: approvedByProfileId,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/kid');
}

export async function rejectChore(choreId: string, reason?: string): Promise<void> {
  await updateChore(choreId, { status: 'not_started' });

  if (reason) {
    const familyId = await getCurrentFamilyId();
    const session = await auth();

    if (familyId && session?.user?.id) {
      const profile = await prisma.profile.findFirst({
        where: { userId: session.user.id, familyId },
        select: { id: true },
      });

      if (profile) {
        await prisma.choreComment.create({
          data: {
            choreId,
            profileId: profile.id,
            comment: `Chore rejected: ${reason}`,
          },
        });
      }
    }
  }
}

export async function deleteChore(choreId: string): Promise<void> {
  await prisma.chore.delete({ where: { id: choreId } });

  revalidatePath('/parent/chores');
  revalidatePath('/kid');
}

export async function cloneChore(choreId: string, createdByProfileId: string): Promise<Chore> {
  const original = await prisma.chore.findUnique({ where: { id: choreId } });
  if (!original) {
    throw new Error('Chore not found');
  }

  return createChore(
    {
      assignedToProfileId: original.assignedToProfileId,
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      pointsValue: original.pointsValue,
      dueDate: original.dueDate || undefined,
      recurrenceRule: original.recurrenceRule || undefined,
    },
    createdByProfileId
  );
}
