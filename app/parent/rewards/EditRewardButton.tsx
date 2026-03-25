'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { updateReward } from '@/app/api/rewards/actions';
import type { Reward, CreateRewardInput } from '@/types';
import RewardFormModal from './RewardFormModal';

interface EditRewardButtonProps {
  reward: Reward;
}

export default function EditRewardButton({ reward }: EditRewardButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (input: CreateRewardInput) => {
    setLoading(true);
    setError(null);

    try {
      await updateReward(reward.id, input);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to update reward:', err);
      setError('Failed to update reward. Please try again.');
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
        aria-label={`Edit reward: ${reward.name}`}
      >
        Edit
      </Button>

      <RewardFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleUpdate}
        loading={loading}
        error={error}
        title="Edit Reward"
        initialData={reward}
      />
    </>
  );
}
