'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RedemptionWithDetails } from '@/types';
import { formatRelativeDate } from '@/lib/utils/dates';

interface MyRedemptionsProps {
  redemptions: RedemptionWithDetails[];
}

export default function MyRedemptions({ redemptions }: MyRedemptionsProps) {
  if (redemptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You haven&apos;t requested any rewards yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by date (newest first)
  const sortedRedemptions = [...redemptions].sort((a, b) => {
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedRedemptions.map(redemption => {
        const getStatusInfo = () => {
          switch (redemption.status) {
            case 'requested':
              return {
                badge: <Badge variant="warning">⏳ Pending</Badge>,
                message: 'Waiting for parent approval',
                color: 'bg-yellow-50 dark:bg-yellow-900/20',
              };
            case 'approved':
            case 'redeemed':
              return {
                badge: <Badge variant="success">✓ Approved</Badge>,
                message: redemption.resolvedAt ? `Approved ${formatRelativeDate(redemption.resolvedAt)}` : 'Approved',
                color: 'bg-success-50 dark:bg-success-900/20',
              };
            case 'rejected':
              return {
                badge: <Badge variant="default">✗ Rejected</Badge>,
                message: redemption.resolvedAt ? `Rejected ${formatRelativeDate(redemption.resolvedAt)}` : 'Rejected',
                color: 'bg-gray-50 dark:bg-gray-900/20',
              };
            default:
              return {
                badge: <Badge variant="default">{redemption.status}</Badge>,
                message: '',
                color: '',
              };
          }
        };

        const statusInfo = getStatusInfo();

        return (
          <Card key={redemption.id} className={statusInfo.color}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {redemption.reward.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Requested {formatRelativeDate(redemption.requestedAt)}
                  </p>
                </div>
                {statusInfo.badge}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {redemption.reward.pointsCost} points
                </span>
                {statusInfo.message && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {statusInfo.message}
                  </span>
                )}
              </div>

              {(redemption.status === 'approved' || redemption.status === 'redeemed') && (
                <div className="mt-3 p-3 bg-success-100 dark:bg-success-900/30 rounded-md">
                  <p className="text-sm text-success-800 dark:text-success-200">
                    🎉 Enjoy your reward! Ask your parents to give it to you.
                  </p>
                </div>
              )}

              {redemption.status === 'rejected' && (
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900/30 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This request was not approved. Keep earning points and try again!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
