'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { deleteReward } from '@/app/api/rewards/actions';

interface DeleteRewardButtonProps {
  rewardId: string;
  rewardTitle: string;
}

export default function DeleteRewardButton({ rewardId, rewardTitle }: DeleteRewardButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${rewardTitle}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteReward(rewardId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete reward:', error);
      alert('Failed to delete reward. Please try again.');
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
