'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { rejectRedemption } from '@/app/api/rewards/actions';

interface RejectRedemptionButtonProps {
  redemptionId: string;
}

export default function RejectRedemptionButton({ redemptionId }: RejectRedemptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const handleReject = async () => {
    setLoading(true);
    try {
      const rejectedByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!rejectedByProfileId) {
        setShowConfirm(false);
        setToastMessage('Profile not selected');
        setToastType('error');
        setShowToast(true);
        return;
      }

      await rejectRedemption(redemptionId, rejectedByProfileId);
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to reject redemption:', error);
      setShowConfirm(false);
      setToastMessage('Failed to reject redemption. Please try again.');
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
        variant="outline"
        size="sm"
      >
        {loading ? 'Rejecting...' : 'Reject'}
      </Button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Reject Redemption"
        message="Are you sure you want to reject this redemption?"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleReject}
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
