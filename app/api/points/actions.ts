'use server';

import { createClient } from '@/lib/supabase/server';
import type { PointsTransaction, ProfileWithPoints } from '@/types';
import { revalidatePath } from 'next/cache';
import { getProfiles } from '../profiles/actions';

/**
 * Get all points transactions for a profile
 */
export async function getPointsTransactions(profileId: string): Promise<PointsTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(transaction => ({
    id: transaction.id,
    profileId: transaction.profile_id,
    amount: transaction.amount,
    reason: transaction.reason,
    relatedChoreId: transaction.related_chore_id,
    relatedRedemptionId: transaction.related_redemption_id,
    notes: transaction.notes,
    createdByProfileId: transaction.created_by_profile_id,
    createdAt: transaction.created_at,
  }));
}

/**
 * Calculate total points for a profile
 */
export async function getProfilePoints(profileId: string): Promise<number> {
  const transactions = await getPointsTransactions(profileId);
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Get all kid profiles with their current points
 */
export async function getKidProfilesWithPoints(): Promise<ProfileWithPoints[]> {
  const profiles = await getProfiles();
  const kidProfiles = profiles.filter(p => p.role === 'kid');

  const profilesWithPoints = await Promise.all(
    kidProfiles.map(async (profile) => {
      const points = await getProfilePoints(profile.id);
      return {
        ...profile,
        totalPoints: points,
      };
    })
  );

  return profilesWithPoints;
}

/**
 * Create a manual points adjustment (parent action)
 */
export async function createManualAdjustment(
  profileId: string,
  amount: number,
  notes: string,
  createdByProfileId: string
): Promise<PointsTransaction> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('points_transactions')
    .insert({
      profile_id: profileId,
      amount,
      reason: 'manual_adjustment',
      notes,
      created_by_profile_id: createdByProfileId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent');
  revalidatePath('/kid');

  return {
    id: data.id,
    profileId: data.profile_id,
    amount: data.amount,
    reason: data.reason,
    relatedChoreId: data.related_chore_id,
    relatedRedemptionId: data.related_redemption_id,
    notes: data.notes,
    createdByProfileId: data.created_by_profile_id,
    createdAt: data.created_at,
  };
}

/**
 * Get points history with details (including related chores/rewards)
 */
export async function getPointsHistory(profileId: string): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('points_transactions')
    .select(`
      *,
      chore:chores(title),
      redemption:reward_redemptions(reward:rewards(name))
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
