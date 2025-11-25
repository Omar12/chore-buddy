'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { requestRedemption } from '@/app/api/rewards/actions';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  currentPoints: number;
  profileId: string;
}

export default function RewardCard({ reward, currentPoints, profileId }: RewardCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canAfford = currentPoints >= reward.pointsCost;

  const handleRedeem = async () => {
    if (!canAfford) {
      alert(`You need ${reward.pointsCost - currentPoints} more points to redeem this reward!`);
      return;
    }

    if (!confirm(`Are you sure you want to request "${reward.title}" for ${reward.pointsCost} points?`)) {
      return;
    }

    setLoading(true);
    try {
      await requestRedemption(reward.id, profileId);
      alert('Redemption requested! Your parents will review it soon.');
      router.refresh();
    } catch (error) {
      console.error('Failed to request redemption:', error);
      alert('Failed to request redemption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`transition-all ${!canAfford ? 'opacity-60' : 'hover:shadow-lg'}`}>
      <CardContent className="py-6">
        <div className="flex flex-col h-full">
          <div className="flex-1 mb-4">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
              {reward.title}
            </h3>

            {reward.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {reward.description}
              </p>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {reward.pointsCost}
              </span>
              <span className="text-gray-600 dark:text-gray-400">points</span>
            </div>

            {!canAfford && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Need {reward.pointsCost - currentPoints} more points
              </p>
            )}
          </div>

          <Button
            onClick={handleRedeem}
            disabled={!canAfford || loading}
            fullWidth
            variant={canAfford ? 'primary' : 'outline'}
          >
            {loading ? 'Requesting...' : canAfford ? '🎁 Redeem' : '🔒 Not Enough Points'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
