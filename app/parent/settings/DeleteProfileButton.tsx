'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { deleteProfile } from '@/app/api/profiles/actions';

interface DeleteProfileButtonProps {
  profileId: string;
  profileName: string;
}

export default function DeleteProfileButton({ profileId, profileName }: DeleteProfileButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProfile(profileId);
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      setShowConfirm(false);
      setToastMessage('Failed to delete profile. Please try again.');
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
        aria-label={`Delete profile: ${profileName}`}
      >
        {loading ? 'Deleting...' : 'Delete'}
      </Button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Profile"
        message={`Are you sure you want to delete "${profileName}"? This will also delete all their chores and points history. This action cannot be undone.`}
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
