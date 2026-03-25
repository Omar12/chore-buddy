'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { approveRedemption } from '@/app/api/rewards/actions';

interface ApproveRedemptionButtonProps {
  redemptionId: string;
}

export default function ApproveRedemptionButton({ redemptionId }: ApproveRedemptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const approvedByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!approvedByProfileId) {
        setToastMessage('Profile not selected');
        setToastType('error');
        setShowToast(true);
        return;
      }

      await approveRedemption(redemptionId, approvedByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve redemption:', error);
      setToastMessage('Failed to approve redemption. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleApprove}
        disabled={loading}
        size="sm"
      >
        {loading ? 'Approving...' : 'Approve'}
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
