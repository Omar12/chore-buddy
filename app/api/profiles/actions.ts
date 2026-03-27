'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Profile, CreateProfileInput, UpdateProfileInput } from '@/types';
import { revalidatePath } from 'next/cache';

function mapProfile(p: any): Profile {
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

export async function getProfiles(): Promise<Profile[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userProfile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
    select: { familyId: true },
  });

  if (!userProfile) {
    throw new Error('Profile not found');
  }

  const data = await prisma.profile.findMany({
    where: { familyId: userProfile.familyId },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });

  return data.map(mapProfile);
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  const data = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!data) return null;
  return mapProfile(data);
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  // Resolve familyId server-side from the authenticated user
  const familyId = input.familyId || (await getCurrentFamilyId());
  if (!familyId) {
    throw new Error('No family found for current user');
  }

  const data = await prisma.profile.create({
    data: {
      familyId,
      name: input.name,
      role: input.role,
      avatarUrl: input.avatarUrl || null,
      pinCode: input.pinCode || null,
      userId: null,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/profile/select');

  return mapProfile(data);
}

export async function updateProfile(profileId: string, input: UpdateProfileInput): Promise<Profile> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
  if (input.pinCode !== undefined) updateData.pinCode = input.pinCode;

  const data = await prisma.profile.update({
    where: { id: profileId },
    data: updateData,
  });

  revalidatePath('/parent');
  revalidatePath('/profile/select');

  return mapProfile(data);
}

export async function deleteProfile(profileId: string): Promise<void> {
  await prisma.profile.delete({ where: { id: profileId } });

  revalidatePath('/parent');
  revalidatePath('/profile/select');
}

export async function getKidProfiles(): Promise<Profile[]> {
  const profiles = await getProfiles();
  return profiles.filter(p => p.role === 'kid');
}

export async function getCurrentFamilyId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userProfile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
    select: { familyId: true },
  });

  return userProfile?.familyId || null;
}
