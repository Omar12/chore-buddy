'use server';

import { createClient } from '@/lib/supabase/server';
import type { Chore, ChoreWithProfile, CreateChoreInput, UpdateChoreInput, ChoreStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { getCurrentFamilyId } from '../profiles/actions';
import { notifyChoreCompleted } from '@/lib/services/notifications';

/**
 * Get all chores for the family
 */
export async function getChores(): Promise<ChoreWithProfile[]> {
  const supabase = await createClient();
  const familyId = await getCurrentFamilyId();

  if (!familyId) {
    throw new Error('No family found');
  }

  const { data, error } = await supabase
    .from('chores')
    .select(`
      *,
      assigned_to:profiles!chores_assigned_to_profile_id_fkey(*),
      created_by:profiles!chores_created_by_profile_id_fkey(*)
    `)
    .eq('family_id', familyId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(chore => ({
    id: chore.id,
    familyId: chore.family_id,
    assignedToProfileId: chore.assigned_to_profile_id,
    title: chore.title,
    description: chore.description,
    pointsValue: chore.points_value,
    dueDate: chore.due_date,
    recurrenceRule: chore.recurrence_rule,
    status: chore.status,
    createdByProfileId: chore.created_by_profile_id,
    createdAt: chore.created_at,
    updatedAt: chore.updated_at,
    assignedTo: {
      id: chore.assigned_to.id,
      familyId: chore.assigned_to.family_id,
      userId: chore.assigned_to.user_id,
      name: chore.assigned_to.name,
      avatarUrl: chore.assigned_to.avatar_url,
      role: chore.assigned_to.role,
      pinCode: chore.assigned_to.pin_code,
      createdAt: chore.assigned_to.created_at,
      updatedAt: chore.assigned_to.updated_at,
    },
    createdBy: {
      id: chore.created_by.id,
      familyId: chore.created_by.family_id,
      userId: chore.created_by.user_id,
      name: chore.created_by.name,
      avatarUrl: chore.created_by.avatar_url,
      role: chore.created_by.role,
      pinCode: chore.created_by.pin_code,
      createdAt: chore.created_by.created_at,
      updatedAt: chore.created_by.updated_at,
    },
  }));
}

/**
 * Get chores for a specific kid profile
 */
export async function getChoresForKid(profileId: string): Promise<ChoreWithProfile[]> {
  const allChores = await getChores();
  return allChores.filter(chore => chore.assignedToProfileId === profileId);
}

/**
 * Get chores pending review
 */
export async function getPendingChores(): Promise<ChoreWithProfile[]> {
  const allChores = await getChores();
  return allChores.filter(chore => chore.status === 'pending_review' || chore.status === 'done');
}

/**
 * Create a new chore
 */
export async function createChore(input: CreateChoreInput, createdByProfileId: string): Promise<Chore> {
  const supabase = await createClient();
  const familyId = await getCurrentFamilyId();

  if (!familyId) {
    throw new Error('No family found');
  }

  const { data, error } = await supabase
    .from('chores')
    .insert({
      family_id: familyId,
      assigned_to_profile_id: input.assignedToProfileId,
      title: input.title,
      description: input.description || null,
      points_value: input.pointsValue,
      due_date: input.dueDate || null,
      recurrence_rule: input.recurrenceRule || null,
      status: 'not_started',
      created_by_profile_id: createdByProfileId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/chores');
  revalidatePath('/kid');

  return {
    id: data.id,
    familyId: data.family_id,
    assignedToProfileId: data.assigned_to_profile_id,
    title: data.title,
    description: data.description,
    pointsValue: data.points_value,
    dueDate: data.due_date,
    recurrenceRule: data.recurrence_rule,
    status: data.status,
    createdByProfileId: data.created_by_profile_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update a chore
 */
export async function updateChore(choreId: string, input: UpdateChoreInput): Promise<Chore> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.pointsValue !== undefined) updateData.points_value = input.pointsValue;
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
  if (input.recurrenceRule !== undefined) updateData.recurrence_rule = input.recurrenceRule;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await supabase
    .from('chores')
    .update(updateData)
    .eq('id', choreId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/chores');
  revalidatePath('/parent/dashboard');
  revalidatePath('/kid');

  return {
    id: data.id,
    familyId: data.family_id,
    assignedToProfileId: data.assigned_to_profile_id,
    title: data.title,
    description: data.description,
    pointsValue: data.points_value,
    dueDate: data.due_date,
    recurrenceRule: data.recurrence_rule,
    status: data.status,
    createdByProfileId: data.created_by_profile_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update chore status (used by kids)
 */
export async function updateChoreStatus(choreId: string, status: ChoreStatus): Promise<void> {
  const supabase = await createClient();

  // Get the chore details for notifications
  const { data: chore } = await supabase
    .from('chores')
    .select(`
      *,
      assigned_to:profiles!chores_assigned_to_profile_id_fkey(name)
    `)
    .eq('id', choreId)
    .single();

  // Update the status
  await updateChore(choreId, { status });

  // Send notification when kid marks chore as done
  if (status === 'done' || status === 'pending_review') {
    if (chore) {
      // Get parent emails
      const { data: parentProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('family_id', chore.family_id)
        .in('role', ['owner', 'parent', 'helper']);

      if (parentProfiles && parentProfiles.length > 0) {
        const userIds = parentProfiles.map(p => p.user_id).filter(Boolean);

        const { data: users } = await supabase
          .from('users')
          .select('email')
          .in('id', userIds);

        if (users && users.length > 0) {
          const parentEmails = users.map(u => u.email);
          await notifyChoreCompleted(
            parentEmails,
            chore.assigned_to.name,
            chore.title
          );
        }
      }
    }
  }
}

/**
 * Approve a chore and award points
 */
export async function approveChore(choreId: string, approvedByProfileId: string): Promise<void> {
  const supabase = await createClient();

  // Get the chore
  const { data: chore, error: choreError } = await supabase
    .from('chores')
    .select('*')
    .eq('id', choreId)
    .single();

  if (choreError || !chore) {
    throw new Error('Chore not found');
  }

  // Update chore status to completed
  await updateChore(choreId, { status: 'completed' });

  // Create points transaction
  const { error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      profile_id: chore.assigned_to_profile_id,
      amount: chore.points_value,
      reason: 'chore_completion',
      related_chore_id: choreId,
      created_by_profile_id: approvedByProfileId,
    });

  if (transactionError) {
    throw new Error('Failed to award points');
  }

  revalidatePath('/parent');
  revalidatePath('/kid');
}

/**
 * Reject a chore
 */
export async function rejectChore(choreId: string, reason?: string): Promise<void> {
  await updateChore(choreId, { status: 'not_started' });

  if (reason) {
    // Add a comment with the rejection reason
    const supabase = await createClient();
    const familyId = await getCurrentFamilyId();

    if (familyId) {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('family_id', familyId)
          .single();

        if (profile) {
          await supabase
            .from('chore_comments')
            .insert({
              chore_id: choreId,
              profile_id: profile.id,
              comment: `Chore rejected: ${reason}`,
            });
        }
      }
    }
  }
}

/**
 * Delete a chore
 */
export async function deleteChore(choreId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', choreId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/parent/chores');
  revalidatePath('/kid');
}

/**
 * Clone a chore
 */
export async function cloneChore(choreId: string, createdByProfileId: string): Promise<Chore> {
  const supabase = await createClient();

  const { data: original, error } = await supabase
    .from('chores')
    .select('*')
    .eq('id', choreId)
    .single();

  if (error || !original) {
    throw new Error('Chore not found');
  }

  return createChore(
    {
      assignedToProfileId: original.assigned_to_profile_id,
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      pointsValue: original.points_value,
      dueDate: original.due_date || undefined,
      recurrenceRule: original.recurrence_rule || undefined,
    },
    createdByProfileId
  );
}
