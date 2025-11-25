'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createReward } from '@/app/api/rewards/actions';
import type { CreateRewardInput } from '@/types';
import RewardFormModal from './RewardFormModal';

export default function CreateRewardButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (input: CreateRewardInput) => {
    setLoading(true);
    setError(null);

    try {
      await createReward(input);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to create reward:', err);
      setError('Failed to create reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Create Reward
      </Button>

      <RewardFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onSubmit={handleCreate}
        loading={loading}
        error={error}
        title="Create New Reward"
      />
    </>
  );
}
