'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createChore } from '@/app/api/chores/actions';
import type { Profile, CreateChoreInput } from '@/types';
import ChoreFormModal from './ChoreFormModal';

interface CreateChoreButtonProps {
  kidProfiles: Profile[];
}

export default function CreateChoreButton({ kidProfiles }: CreateChoreButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (input: CreateChoreInput) => {
    setLoading(true);
    setError(null);

    try {
      const createdByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!createdByProfileId) {
        setError('Profile not selected');
        return;
      }

      await createChore(input, createdByProfileId);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to create chore:', err);
      setError('Failed to create chore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Create Chore
      </Button>

      <ChoreFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleCreate}
        kidProfiles={kidProfiles}
        loading={loading}
        error={error}
        title="Create New Chore"
      />
    </>
  );
}
