'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { rejectChore } from '@/app/api/chores/actions';

interface RejectChoreButtonProps {
  choreId: string;
}

export default function RejectChoreButton({ choreId }: RejectChoreButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectChore(choreId, rejectionReason || undefined);
      setShowConfirm(false);
      setRejectionReason('');
      router.refresh();
    } catch (error) {
      console.error('Failed to reject chore:', error);
      setShowConfirm(false);
      setToastMessage('Failed to reject chore. Please try again.');
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
        title="Reject Chore"
        message="Are you sure you want to reject this chore?"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleReject}
        onCancel={() => {
          setShowConfirm(false);
          setRejectionReason('');
        }}
        input={{
          value: rejectionReason,
          onChange: setRejectionReason,
          placeholder: 'Optional reason...',
          label: 'Reason for rejection',
        }}
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
