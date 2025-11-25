'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AuthResponse {
  error?: string;
  success?: boolean;
}

/**
 * Register a new user with email and password
 */
export async function signUp(email: string, password: string, familyName: string): Promise<AuthResponse> {
  const supabase = await createClient();

  // Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user account' };
  }

  // Create the family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name: familyName,
      owner_id: authData.user.id,
    })
    .select()
    .single();

  if (familyError || !family) {
    // return { error: 'Failed to create family. Please try again.' };
    console.log(familyError)
    return { error: `Error! ${familyError}` };
  }

  // Create the owner profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      family_id: family.id,
      user_id: authData.user.id,
      name: email.split('@')[0], // Default name from email
      role: 'owner',
    });

  if (profileError) {
    return { error: 'Failed to create profile. Please try again.' };
  }

  revalidatePath('/', 'layout');
  redirect('/profile/select');
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/profile/select');
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Update password after reset
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
