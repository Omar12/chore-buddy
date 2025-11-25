'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { updateProfile } from '@/app/api/profiles/actions';
import type { Profile, CreateProfileInput } from '@/types';
import ProfileFormModal from './ProfileFormModal';

interface EditProfileButtonProps {
  profile: Profile;
}

export default function EditProfileButton({ profile }: EditProfileButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (input: CreateProfileInput) => {
    setLoading(true);
    setError(null);

    try {
      await updateProfile(profile.id, input);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
      >
        Edit
      </Button>

      <ProfileFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleUpdate}
        loading={loading}
        error={error}
        title="Edit Profile"
        type={profile.role === 'kid' ? 'kid' : 'parent'}
        initialData={profile}
      />
    </>
  );
}
