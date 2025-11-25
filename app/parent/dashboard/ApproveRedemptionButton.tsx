'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { approveRedemption } from '@/app/api/rewards/actions';

interface ApproveRedemptionButtonProps {
  redemptionId: string;
}

export default function ApproveRedemptionButton({ redemptionId }: ApproveRedemptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const approvedByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!approvedByProfileId) {
        alert('Profile not selected');
        return;
      }

      await approveRedemption(redemptionId, approvedByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve redemption:', error);
      alert('Failed to approve redemption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleApprove}
      disabled={loading}
      size="sm"
    >
      {loading ? 'Approving...' : 'Approve'}
    </Button>
  );
}
