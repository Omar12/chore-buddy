'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { updateChore } from '@/app/api/chores/actions';
import type { Profile, Chore, CreateChoreInput } from '@/types';
import ChoreFormModal from './ChoreFormModal';

interface EditChoreButtonProps {
  chore: Chore;
  kidProfiles: Profile[];
}

export default function EditChoreButton({ chore, kidProfiles }: EditChoreButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (input: CreateChoreInput) => {
    setLoading(true);
    setError(null);

    try {
      await updateChore(chore.id, input);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to update chore:', err);
      setError('Failed to update chore. Please try again.');
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

      <ChoreFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleUpdate}
        kidProfiles={kidProfiles}
        loading={loading}
        error={error}
        title="Edit Chore"
        initialData={chore}
      />
    </>
  );
}
