'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Reward } from '@/types';
import EditRewardButton from './EditRewardButton';
import DeleteRewardButton from './DeleteRewardButton';

interface RewardsSectionProps {
  rewards: Reward[];
}

export default function RewardsSection({ rewards }: RewardsSectionProps) {
  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No rewards created yet. Create your first reward to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewards.map(reward => (
        <Card key={reward.id}>
          <CardContent className="py-4">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                  {reward.name}
                </h3>
                <Badge variant={reward.isActive ? 'success' : 'default'}>
                  {reward.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {reward.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
                  {reward.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {reward.pointsCost} points
                </div>

                <div className="flex gap-2 pt-2">
                  <EditRewardButton reward={reward} />
                  <DeleteRewardButton rewardId={reward.id} rewardTitle={reward.name} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
