'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { updateChoreStatus } from '@/app/api/chores/actions';
import type { Chore } from '@/types';
import { formatRelativeDate } from '@/lib/utils/dates';

interface ChoreCardProps {
  chore: Chore;
}

export default function ChoreCard({ chore }: ChoreCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'in_progress' | 'pending_review') => {
    setLoading(true);
    try {
      await updateChoreStatus(chore.id, newStatus);
      router.refresh();
    } catch (error) {
      console.error('Failed to update chore status:', error);
      alert('Failed to update chore. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (chore.status) {
      case 'completed':
        return <Badge variant="success">✓ Completed</Badge>;
      case 'pending_review':
        return <Badge variant="warning">⏳ Waiting for approval</Badge>;
      case 'in_progress':
        return <Badge variant="info">🔄 In Progress</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  };

  const getActionButtons = () => {
    if (chore.status === 'completed') {
      return null;
    }

    if (chore.status === 'pending_review') {
      return (
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-700 dark:text-yellow-300">
            Waiting for parent approval...
          </div>
        </div>
      );
    }

    if (chore.status === 'in_progress') {
      return (
        <Button
          onClick={() => handleStatusChange('pending_review')}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Marking...' : '✓ I\'m Done!'}
        </Button>
      );
    }

    // not_started
    return (
      <Button
        onClick={() => handleStatusChange('in_progress')}
        disabled={loading}
        variant="secondary"
        fullWidth
      >
        {loading ? 'Starting...' : '🚀 On it!'}
      </Button>
    );
  };

  const isOverdue = chore.dueDate && new Date(chore.dueDate) < new Date() && chore.status !== 'completed';

  return (
    <Card className={isOverdue ? 'border-red-200 dark:border-red-800' : ''}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {chore.title}
              </h3>
              {getStatusBadge()}
            </div>

            {chore.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {chore.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {chore.pointsValue}
                </span>
                <span className="text-gray-600 dark:text-gray-400">points</span>
              </div>

              {chore.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                  <span>{isOverdue ? '⚠️' : '📅'}</span>
                  <span>Due: {formatRelativeDate(chore.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="sm:w-48">
            {getActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
