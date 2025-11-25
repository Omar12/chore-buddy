'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { rejectChore } from '@/app/api/chores/actions';

interface RejectChoreButtonProps {
  choreId: string;
}

export default function RejectChoreButton({ choreId }: RejectChoreButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setLoading(true);
    try {
      await rejectChore(choreId, reason || undefined);
      router.refresh();
    } catch (error) {
      console.error('Failed to reject chore:', error);
      alert('Failed to reject chore. Please try again.');
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
