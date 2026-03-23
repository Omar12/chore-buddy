'use server';

import { prisma } from '@/lib/db';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AuthResponse {
  error?: string;
  success?: boolean;
}

export async function signUp(email: string, password: string, familyName: string): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'An account with this email already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
    },
  });

  await prisma.family.create({
    data: {
      name: familyName,
      ownerId: user.id,
      profiles: {
        create: {
          userId: user.id,
          name: email.split('@')[0],
          role: 'owner',
        },
      },
    },
  });

  // Sign in after registration
  try {
    await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch {
    // Sign in may throw on redirect, that's okay
  }

  revalidatePath('/', 'layout');
  redirect('/profile/select');
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: 'Invalid email or password' };
  }

  revalidatePath('/', 'layout');
  redirect('/profile/select');
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirect: false });
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  // Stub — no email service configured
  return { success: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword },
  });

  return { success: true };
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
}
