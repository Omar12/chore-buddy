'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { rejectRedemption } from '@/app/api/rewards/actions';

interface RejectRedemptionButtonProps {
  redemptionId: string;
}

export default function RejectRedemptionButton({ redemptionId }: RejectRedemptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this redemption?')) {
      return;
    }

    setLoading(true);
    try {
      const rejectedByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!rejectedByProfileId) {
        alert('Profile not selected');
        return;
      }

      await rejectRedemption(redemptionId, rejectedByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to reject redemption:', error);
      alert('Failed to reject redemption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleReject}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? 'Rejecting...' : 'Reject'}
    </Button>
  );
}
