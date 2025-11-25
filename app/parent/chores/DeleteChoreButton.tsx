'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { deleteChore } from '@/app/api/chores/actions';

interface DeleteChoreButtonProps {
  choreId: string;
  choreTitle: string;
}

export default function DeleteChoreButton({ choreId, choreTitle }: DeleteChoreButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${choreTitle}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteChore(choreId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete chore:', error);
      alert('Failed to delete chore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="danger"
      size="sm"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
