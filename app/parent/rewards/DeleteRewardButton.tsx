'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { deleteReward } from '@/app/api/rewards/actions';

interface DeleteRewardButtonProps {
  rewardId: string;
  rewardTitle: string;
}

export default function DeleteRewardButton({ rewardId, rewardTitle }: DeleteRewardButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteReward(rewardId);
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete reward:', error);
      setShowConfirm(false);
      setToastMessage('Failed to delete reward. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        variant="danger"
        size="sm"
        aria-label={`Delete reward: ${rewardTitle}`}
      >
        {loading ? 'Deleting...' : 'Delete'}
      </Button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Reward"
        message={`Are you sure you want to delete "${rewardTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
