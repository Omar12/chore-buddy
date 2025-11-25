'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { deleteProfile } from '@/app/api/profiles/actions';

interface DeleteProfileButtonProps {
  profileId: string;
  profileName: string;
}

export default function DeleteProfileButton({ profileId, profileName }: DeleteProfileButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${profileName}"? This will also delete all their chores and points history. This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteProfile(profileId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="danger"
      size="sm"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
