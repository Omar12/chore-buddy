'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RedemptionWithDetails, Profile } from '@/types';
import { formatRelativeDate } from '@/lib/utils/dates';
import ApproveRedemptionButton from '../dashboard/ApproveRedemptionButton';
import RejectRedemptionButton from '../dashboard/RejectRedemptionButton';

interface RedemptionsSectionProps {
  redemptions: RedemptionWithDetails[];
  profiles: Profile[];
}

type RedemptionStatus = 'all' | 'requested' | 'approved' | 'rejected';

export default function RedemptionsSection({ redemptions, profiles }: RedemptionsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus>('all');

  const profileMap = useMemo(
    () => new Map(profiles.map(p => [p.id, p])),
    [profiles]
  );

  const filteredRedemptions = useMemo(() => {
    if (statusFilter === 'all') return redemptions;
    return redemptions.filter(r => r.status === statusFilter);
  }, [redemptions, statusFilter]);

  const sortedRedemptions = useMemo(() => {
    return [...filteredRedemptions].sort((a, b) => {
      // Requested first
      if (a.status === 'requested' && b.status !== 'requested') return -1;
      if (a.status !== 'requested' && b.status === 'requested') return 1;

      // Then by requested date (newest first)
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
  }, [filteredRedemptions]);

  if (redemptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No redemptions yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Status Filter */}
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RedemptionStatus)}
              className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All ({redemptions.length})</option>
              <option value="requested">Requested ({redemptions.filter(r => r.status === 'requested').length})</option>
              <option value="approved">Approved ({redemptions.filter(r => r.status === 'approved').length})</option>
              <option value="rejected">Rejected ({redemptions.filter(r => r.status === 'rejected').length})</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Showing {sortedRedemptions.length} of {redemptions.length} redemptions
      </div>

      {sortedRedemptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No redemptions found matching your filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRedemptions.map(redemption => {
            const profile = profileMap.get(redemption.profileId);
            const resolvedByProfile = redemption.resolvedByProfileId
              ? profileMap.get(redemption.resolvedByProfileId)
              : null;

            return (
              <Card key={redemption.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {redemption.reward.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Requested by: {profile?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            redemption.status === 'approved' || redemption.status === 'redeemed' ? 'success' :
                            redemption.status === 'rejected' ? 'default' :
                            'warning'
                          }
                          className="ml-2"
                        >
                          {redemption.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex gap-3">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {redemption.reward.pointsCost} points
                          </span>
                          <span>Requested: {formatRelativeDate(redemption.requestedAt)}</span>
                        </div>

                        {(redemption.status === 'approved' || redemption.status === 'redeemed') && redemption.resolvedAt && (
                          <div>
                            Approved: {formatRelativeDate(redemption.resolvedAt)}
                            {resolvedByProfile && ` by ${resolvedByProfile.name}`}
                          </div>
                        )}

                        {redemption.status === 'rejected' && redemption.resolvedAt && (
                          <div>
                            Rejected: {formatRelativeDate(redemption.resolvedAt)}
                            {resolvedByProfile && ` by ${resolvedByProfile.name}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {redemption.status === 'requested' && (
                      <div className="flex gap-2">
                        <ApproveRedemptionButton redemptionId={redemption.id} />
                        <RejectRedemptionButton redemptionId={redemption.id} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
