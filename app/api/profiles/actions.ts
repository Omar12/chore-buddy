'use server';

import { createClient } from '@/lib/supabase/server';
import type { Profile, CreateProfileInput, UpdateProfileInput } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Get all profiles for the user's family
 */
export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's profile to find their family
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  if (!userProfile) {
    throw new Error('Profile not found');
  }

  // Get all profiles in the family
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('family_id', userProfile.family_id)
    .order('role', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(profile => ({
    id: profile.id,
    familyId: profile.family_id,
    userId: profile.user_id,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    pinCode: profile.pin_code,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }));
}

/**
 * Get a single profile by ID
 */
export async function getProfile(profileId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    familyId: data.family_id,
    userId: data.user_id,
    name: data.name,
    avatarUrl: data.avatar_url,
    role: data.role,
    pinCode: data.pin_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create a new profile (kid or adult)
 */
export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      family_id: input.familyId,
      name: input.name,
      role: input.role,
      avatar_url: input.avatarUrl || null,
      pin_code: input.pinCode || null,
      user_id: null, // Kids don't have user accounts
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent');
  revalidatePath('/profile/select');

  return {
    id: data.id,
    familyId: data.family_id,
    userId: data.user_id,
    name: data.name,
    avatarUrl: data.avatar_url,
    role: data.role,
    pinCode: data.pin_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update an existing profile
 */
export async function updateProfile(profileId: string, input: UpdateProfileInput): Promise<Profile> {
  const supabase = await createClient();

  const updateData: Record<string, string | null> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.pinCode !== undefined) updateData.pin_code = input.pinCode;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent');
  revalidatePath('/profile/select');

  return {
    id: data.id,
    familyId: data.family_id,
    userId: data.user_id,
    name: data.name,
    avatarUrl: data.avatar_url,
    role: data.role,
    pinCode: data.pin_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a profile
 */
export async function deleteProfile(profileId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent');
  revalidatePath('/profile/select');
}

/**
 * Get kid profiles in the family
 */
export async function getKidProfiles(): Promise<Profile[]> {
  const profiles = await getProfiles();
  return profiles.filter(p => p.role === 'kid');
}

/**
 * Get current user's family ID
 */
export async function getCurrentFamilyId(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  return userProfile?.family_id || null;
}
