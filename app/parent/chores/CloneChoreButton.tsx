'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { cloneChore } from '@/app/api/chores/actions';
import type { Chore } from '@/types';

interface CloneChoreButtonProps {
  chore: Chore;
}

export default function CloneChoreButton({ chore }: CloneChoreButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

  const handleClone = async () => {
    setLoading(true);
    try {
      const createdByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!createdByProfileId) {
        setToastMessage('Profile not selected');
        setToastType('error');
        setShowToast(true);
        return;
      }

      await cloneChore(chore.id, createdByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to clone chore:', error);
      setToastMessage('Failed to clone chore. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClone}
        disabled={loading}
        variant="secondary"
        size="sm"
        aria-label={`Clone chore: ${chore.title}`}
      >
        {loading ? 'Cloning...' : 'Clone'}
      </Button>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
