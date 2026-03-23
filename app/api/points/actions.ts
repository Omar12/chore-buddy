'use server';

import { prisma } from '@/lib/db';
import type { PointsTransaction, ProfileWithPoints } from '@/types';
import { revalidatePath } from 'next/cache';
import { getProfiles } from '../profiles/actions';

function mapTransaction(t: any): PointsTransaction {
  return {
    id: t.id,
    profileId: t.profileId,
    amount: t.amount,
    reason: t.reason,
    relatedChoreId: t.relatedChoreId,
    relatedRedemptionId: t.relatedRedemptionId,
    notes: t.notes,
    createdByProfileId: t.createdByProfileId,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function getPointsTransactions(profileId: string): Promise<PointsTransaction[]> {
  const data = await prisma.pointsTransaction.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  });

  return data.map(mapTransaction);
}

export async function getProfilePoints(profileId: string): Promise<number> {
  const result = await prisma.pointsTransaction.aggregate({
    where: { profileId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getKidProfilesWithPoints(): Promise<ProfileWithPoints[]> {
  const profiles = await getProfiles();
  const kidProfiles = profiles.filter(p => p.role === 'kid');

  const profilesWithPoints = await Promise.all(
    kidProfiles.map(async (profile) => {
      const points = await getProfilePoints(profile.id);
      return { ...profile, totalPoints: points };
    })
  );

  return profilesWithPoints;
}

export async function createManualAdjustment(
  profileId: string,
  amount: number,
  notes: string,
  createdByProfileId: string
): Promise<PointsTransaction> {
  const data = await prisma.pointsTransaction.create({
    data: {
      profileId,
      amount,
      reason: 'manual_adjustment',
      notes,
      createdByProfileId,
    },
  });

  revalidatePath('/parent');
  revalidatePath('/kid');

  return mapTransaction(data);
}

export async function getPointsHistory(profileId: string): Promise<any[]> {
  const data = await prisma.pointsTransaction.findMany({
    where: { profileId },
    include: {
      chore: { select: { title: true } },
      redemption: {
        include: { reward: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return data;
}
