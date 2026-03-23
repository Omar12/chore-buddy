'use server';

import { prisma } from '@/lib/db';
import type { Reward, RewardRedemption, RedemptionWithDetails, CreateRewardInput, UpdateRewardInput } from '@/types';
import { revalidatePath } from 'next/cache';
import { getCurrentFamilyId } from '../profiles/actions';
import { notifyRewardRequested, notifyRewardApproved } from '@/lib/services/notifications';

function mapReward(r: any): Reward {
  return {
    id: r.id,
    familyId: r.familyId,
    name: r.name,
    description: r.description,
    pointsCost: r.pointsCost,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

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

export async function getRewards(): Promise<Reward[]> {
  const familyId = await getCurrentFamilyId();
  if (!familyId) {
    throw new Error('No family found');
  }

  const data = await prisma.reward.findMany({
    where: { familyId },
    orderBy: { pointsCost: 'asc' },
  });

  return data.map(mapReward);
}

export async function getActiveRewards(): Promise<Reward[]> {
  const rewards = await getRewards();
  return rewards.filter(r => r.isActive);
}

export async function createReward(input: CreateRewardInput): Promise<Reward> {
  const familyId = await getCurrentFamilyId();
  if (!familyId) {
    throw new Error('No family found');
  }

  const data = await prisma.reward.create({
    data: {
      familyId,
      name: input.name,
      description: input.description || null,
      pointsCost: input.pointsCost,
      isActive: true,
    },
  });

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return mapReward(data);
}

export async function updateReward(rewardId: string, input: UpdateRewardInput): Promise<Reward> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pointsCost !== undefined) updateData.pointsCost = input.pointsCost;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const data = await prisma.reward.update({
    where: { id: rewardId },
    data: updateData,
  });

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return mapReward(data);
}

export async function deleteReward(rewardId: string): Promise<void> {
  await prisma.reward.delete({ where: { id: rewardId } });

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');
}

export async function requestRedemption(rewardId: string, profileId: string): Promise<RewardRedemption> {
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { name: true },
  });

  const data = await prisma.rewardRedemption.create({
    data: {
      rewardId,
      profileId,
      status: 'requested',
    },
  });

  if (reward && profile) {
    const parentProfiles = await prisma.profile.findMany({
      where: {
        familyId: reward.familyId,
        role: { in: ['owner', 'parent', 'helper'] },
        userId: { not: null },
      },
      select: { user: { select: { email: true } } },
    });

    const parentEmails = parentProfiles
      .map(p => p.user?.email)
      .filter((e): e is string => !!e);

    if (parentEmails.length > 0) {
      await notifyRewardRequested(parentEmails, profile.name, reward.name, reward.pointsCost);
    }
  }

  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return {
    id: data.id,
    rewardId: data.rewardId,
    profileId: data.profileId,
    status: data.status as RewardRedemption['status'],
    requestedAt: data.requestedAt.toISOString(),
    resolvedAt: data.resolvedAt?.toISOString() || null,
    resolvedByProfileId: data.resolvedByProfileId,
  };
}

export async function getRedemptions(): Promise<RedemptionWithDetails[]> {
  const familyId = await getCurrentFamilyId();
  if (!familyId) {
    throw new Error('No family found');
  }

  const data = await prisma.rewardRedemption.findMany({
    where: {
      reward: { familyId },
    },
    include: {
      reward: true,
      profile: true,
      resolvedBy: true,
    },
    orderBy: { requestedAt: 'desc' },
  });

  return data.map((redemption: any) => ({
    id: redemption.id,
    rewardId: redemption.rewardId,
    profileId: redemption.profileId,
    status: redemption.status,
    requestedAt: redemption.requestedAt.toISOString(),
    resolvedAt: redemption.resolvedAt?.toISOString() || null,
    resolvedByProfileId: redemption.resolvedByProfileId,
    reward: mapReward(redemption.reward),
    profile: mapProfile(redemption.profile),
    resolvedBy: redemption.resolvedBy ? mapProfile(redemption.resolvedBy) : null,
  }));
}

export async function getPendingRedemptions(): Promise<RedemptionWithDetails[]> {
  const redemptions = await getRedemptions();
  return redemptions.filter(r => r.status === 'requested');
}

export async function approveRedemption(redemptionId: string, approvedByProfileId: string): Promise<void> {
  const redemption = await prisma.rewardRedemption.findUnique({
    where: { id: redemptionId },
    include: { reward: true, profile: true },
  });

  if (!redemption) {
    throw new Error('Redemption not found');
  }

  await prisma.rewardRedemption.update({
    where: { id: redemptionId },
    data: {
      status: 'redeemed',
      resolvedAt: new Date(),
      resolvedByProfileId: approvedByProfileId,
    },
  });

  await prisma.pointsTransaction.create({
    data: {
      profileId: redemption.profileId,
      amount: -redemption.reward.pointsCost,
      reason: 'reward_redemption',
      relatedRedemptionId: redemptionId,
      createdByProfileId: approvedByProfileId,
    },
  });

  const kidEmail = redemption.profile.userId
    ? (await prisma.user.findUnique({
        where: { id: redemption.profile.userId },
        select: { email: true },
      }))?.email ?? null
    : null;

  await notifyRewardApproved(kidEmail, redemption.reward.name);

  revalidatePath('/parent');
  revalidatePath('/kid');
}

export async function rejectRedemption(redemptionId: string, rejectedByProfileId: string): Promise<void> {
  await prisma.rewardRedemption.update({
    where: { id: redemptionId },
    data: {
      status: 'rejected',
      resolvedAt: new Date(),
      resolvedByProfileId: rejectedByProfileId,
    },
  });

  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');
}
