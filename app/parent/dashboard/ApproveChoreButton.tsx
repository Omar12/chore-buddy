'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { approveChore } from '@/app/api/chores/actions';

interface ApproveChoreButtonProps {
  choreId: string;
}

export default function ApproveChoreButton({ choreId }: ApproveChoreButtonProps) {
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

      await approveChore(choreId, approvedByProfileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve chore:', error);
      alert('Failed to approve chore. Please try again.');
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
