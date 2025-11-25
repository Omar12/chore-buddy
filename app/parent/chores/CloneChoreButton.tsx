'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { cloneChore } from '@/app/api/chores/actions';
import type { Chore } from '@/types';

interface CloneChoreButtonProps {
  chore: Chore;
}

export default function CloneChoreButton({ chore }: CloneChoreButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    setLoading(true);
    try {
      const createdByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!createdByProfileId) {
        alert('Profile not selected');
        return;
      }

      await cloneChore(chore.id, createdByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to clone chore:', error);
      alert('Failed to clone chore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClone}
      disabled={loading}
      variant="secondary"
      size="sm"
    >
      {loading ? 'Cloning...' : 'Clone'}
    </Button>
  );
}
