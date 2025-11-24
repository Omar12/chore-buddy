'use server';

import { createClient } from '@/lib/supabase/server';
import type { Reward, RewardRedemption, RedemptionWithDetails, CreateRewardInput, UpdateRewardInput } from '@/types';
import { revalidatePath } from 'next/cache';
import { getCurrentFamilyId } from '../profiles/actions';
import { notifyRewardRequested, notifyRewardApproved } from '@/lib/services/notifications';

/**
 * Get all rewards for the family
 */
export async function getRewards(): Promise<Reward[]> {
  const supabase = await createClient();
  const familyId = await getCurrentFamilyId();

  if (!familyId) {
    throw new Error('No family found');
  }

  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('family_id', familyId)
    .order('points_cost', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(reward => ({
    id: reward.id,
    familyId: reward.family_id,
    name: reward.name,
    description: reward.description,
    pointsCost: reward.points_cost,
    isActive: reward.is_active,
    createdAt: reward.created_at,
    updatedAt: reward.updated_at,
  }));
}

/**
 * Get active rewards only
 */
export async function getActiveRewards(): Promise<Reward[]> {
  const rewards = await getRewards();
  return rewards.filter(r => r.isActive);
}

/**
 * Create a new reward
 */
export async function createReward(input: CreateRewardInput): Promise<Reward> {
  const supabase = await createClient();
  const familyId = await getCurrentFamilyId();

  if (!familyId) {
    throw new Error('No family found');
  }

  const { data, error } = await supabase
    .from('rewards')
    .insert({
      family_id: familyId,
      name: input.name,
      description: input.description || null,
      points_cost: input.pointsCost,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return {
    id: data.id,
    familyId: data.family_id,
    name: data.name,
    description: data.description,
    pointsCost: data.points_cost,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update a reward
 */
export async function updateReward(rewardId: string, input: UpdateRewardInput): Promise<Reward> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pointsCost !== undefined) updateData.points_cost = input.pointsCost;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabase
    .from('rewards')
    .update(updateData)
    .eq('id', rewardId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return {
    id: data.id,
    familyId: data.family_id,
    name: data.name,
    description: data.description,
    pointsCost: data.points_cost,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a reward
 */
export async function deleteReward(rewardId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', rewardId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');
}

/**
 * Request a reward redemption (kid action)
 */
export async function requestRedemption(rewardId: string, profileId: string): Promise<RewardRedemption> {
  const supabase = await createClient();

  // Get the reward and profile details
  const { data: reward } = await supabase
    .from('rewards')
    .select('*, family_id')
    .eq('id', rewardId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', profileId)
    .single();

  const { data, error } = await supabase
    .from('reward_redemptions')
    .insert({
      reward_id: rewardId,
      profile_id: profileId,
      status: 'requested',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Send notification to parents
  if (reward && profile) {
    const { data: parentProfiles } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('family_id', reward.family_id)
      .in('role', ['owner', 'parent', 'helper']);

    if (parentProfiles && parentProfiles.length > 0) {
      const userIds = parentProfiles.map(p => p.user_id).filter(Boolean);

      const { data: users } = await supabase
        .from('users')
        .select('email')
        .in('id', userIds);

      if (users && users.length > 0) {
        const parentEmails = users.map(u => u.email);
        await notifyRewardRequested(
          parentEmails,
          profile.name,
          reward.name,
          reward.points_cost
        );
      }
    }
  }

  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');

  return {
    id: data.id,
    rewardId: data.reward_id,
    profileId: data.profile_id,
    status: data.status,
    requestedAt: data.requested_at,
    resolvedAt: data.resolved_at,
    resolvedByProfileId: data.resolved_by_profile_id,
  };
}

/**
 * Get all redemptions for the family
 */
export async function getRedemptions(): Promise<RedemptionWithDetails[]> {
  const supabase = await createClient();
  const familyId = await getCurrentFamilyId();

  if (!familyId) {
    throw new Error('No family found');
  }

  const { data, error } = await supabase
    .from('reward_redemptions')
    .select(`
      *,
      reward:rewards(*),
      profile:profiles!reward_redemptions_profile_id_fkey(*),
      resolved_by:profiles!reward_redemptions_resolved_by_profile_id_fkey(*)
    `)
    .eq('reward.family_id', familyId)
    .order('requested_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((redemption: any) => ({
    id: redemption.id,
    rewardId: redemption.reward_id,
    profileId: redemption.profile_id,
    status: redemption.status,
    requestedAt: redemption.requested_at,
    resolvedAt: redemption.resolved_at,
    resolvedByProfileId: redemption.resolved_by_profile_id,
    reward: {
      id: redemption.reward.id,
      familyId: redemption.reward.family_id,
      name: redemption.reward.name,
      description: redemption.reward.description,
      pointsCost: redemption.reward.points_cost,
      isActive: redemption.reward.is_active,
      createdAt: redemption.reward.created_at,
      updatedAt: redemption.reward.updated_at,
    },
    profile: {
      id: redemption.profile.id,
      familyId: redemption.profile.family_id,
      userId: redemption.profile.user_id,
      name: redemption.profile.name,
      avatarUrl: redemption.profile.avatar_url,
      role: redemption.profile.role,
      pinCode: redemption.profile.pin_code,
      createdAt: redemption.profile.created_at,
      updatedAt: redemption.profile.updated_at,
    },
    resolvedBy: redemption.resolved_by ? {
      id: redemption.resolved_by.id,
      familyId: redemption.resolved_by.family_id,
      userId: redemption.resolved_by.user_id,
      name: redemption.resolved_by.name,
      avatarUrl: redemption.resolved_by.avatar_url,
      role: redemption.resolved_by.role,
      pinCode: redemption.resolved_by.pin_code,
      createdAt: redemption.resolved_by.created_at,
      updatedAt: redemption.resolved_by.updated_at,
    } : null,
  }));
}

/**
 * Get pending redemptions
 */
export async function getPendingRedemptions(): Promise<RedemptionWithDetails[]> {
  const redemptions = await getRedemptions();
  return redemptions.filter(r => r.status === 'requested');
}

/**
 * Approve and redeem a reward (deduct points)
 */
export async function approveRedemption(redemptionId: string, approvedByProfileId: string): Promise<void> {
  const supabase = await createClient();

  // Get the redemption details
  const { data: redemption, error: redemptionError } = await supabase
    .from('reward_redemptions')
    .select('*, reward:rewards(*), profile:profiles!reward_redemptions_profile_id_fkey(*)')
    .eq('id', redemptionId)
    .single();

  if (redemptionError || !redemption) {
    throw new Error('Redemption not found');
  }

  // Update redemption status
  await supabase
    .from('reward_redemptions')
    .update({
      status: 'redeemed',
      resolved_at: new Date().toISOString(),
      resolved_by_profile_id: approvedByProfileId,
    })
    .eq('id', redemptionId);

  // Create points transaction (deduct points)
  await supabase
    .from('points_transactions')
    .insert({
      profile_id: redemption.profile_id,
      amount: -redemption.reward.points_cost,
      reason: 'reward_redemption',
      related_redemption_id: redemptionId,
      created_by_profile_id: approvedByProfileId,
    });

  // Get kid's email if available
  const kidEmail = redemption.profile.user_id ? (
    await supabase
      .from('users')
      .select('email')
      .eq('id', redemption.profile.user_id)
      .single()
  ).data?.email : null;

  // Notify kid
  await notifyRewardApproved(kidEmail, redemption.reward.name);

  revalidatePath('/parent');
  revalidatePath('/kid');
}

/**
 * Reject a redemption request
 */
export async function rejectRedemption(redemptionId: string, rejectedByProfileId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('reward_redemptions')
    .update({
      status: 'rejected',
      resolved_at: new Date().toISOString(),
      resolved_by_profile_id: rejectedByProfileId,
    })
    .eq('id', redemptionId);

  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/rewards');
  revalidatePath('/kid/rewards');
}
