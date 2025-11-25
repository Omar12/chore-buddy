'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createProfile } from '@/app/api/profiles/actions';
import type { CreateProfileInput } from '@/types';
import ProfileFormModal from './ProfileFormModal';

interface CreateProfileButtonProps {
  type: 'parent' | 'kid';
}

export default function CreateProfileButton({ type }: CreateProfileButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (input: CreateProfileInput) => {
    setLoading(true);
    setError(null);

    try {
      await createProfile(input);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to create profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Add {type === 'kid' ? 'Kid' : 'Parent/Helper'}
      </Button>

      <ProfileFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleCreate}
        loading={loading}
        error={error}
        title={`Add ${type === 'kid' ? 'Kid' : 'Parent/Helper'}`}
        type={type}
      />
    </>
  );
}
