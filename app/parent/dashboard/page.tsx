import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getKidProfilesWithPoints } from '@/app/api/points/actions';
import { getPendingChores, approveChore, rejectChore } from '@/app/api/chores/actions';
import { getPendingRedemptions } from '@/app/api/rewards/actions';
import { getProfiles } from '@/app/api/profiles/actions';
import type { Chore, RedemptionWithDetails, Profile } from '@/types';
import { formatDate, formatRelativeDate } from '@/lib/utils/dates';
import ApproveChoreButton from './ApproveChoreButton';
import RejectChoreButton from './RejectChoreButton';
import ApproveRedemptionButton from './ApproveRedemptionButton';
import RejectRedemptionButton from './RejectRedemptionButton';

interface KidWithStats {
  profile: Profile;
  points: number;
  todaysChores: number;
  incompleteChores: number;
  pendingReviews: number;
}

async function getKidsWithStats(): Promise<KidWithStats[]> {
  const kidsWithPoints = await getKidProfilesWithPoints();
  const allProfiles = await getProfiles();
  const allChores = await import('@/app/api/chores/actions').then(m => m.getChores());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return kidsWithPoints.map((kidProfile) => {
    const kidChores = allChores.filter(c => c.assignedToProfileId === kidProfile.id);

    const todaysChores = kidChores.filter(chore => {
      if (!chore.dueDate) return false;
      const dueDate = new Date(chore.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;

    const incompleteChores = kidChores.filter(
      c => c.status === 'not_started' || c.status === 'in_progress'
    ).length;

    const pendingReviews = kidChores.filter(
      c => c.status === 'pending_review'
    ).length;

    return {
      profile: {
        id: kidProfile.id,
        familyId: kidProfile.familyId,
        userId: kidProfile.userId,
        name: kidProfile.name,
        avatarUrl: kidProfile.avatarUrl,
        role: kidProfile.role,
        pinCode: kidProfile.pinCode,
        createdAt: kidProfile.createdAt,
        updatedAt: kidProfile.updatedAt,
      },
      points: kidProfile.totalPoints,
      todaysChores,
      incompleteChores,
      pendingReviews,
    };
  });
}

export default async function ParentDashboard() {
  const kidsWithStats = await getKidsWithStats();
  const pendingChores = await getPendingChores();
  const pendingRedemptions = await getPendingRedemptions();
  const profiles = await getProfiles();

  // Create a map for quick profile lookup
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your family&apos;s chores and rewards
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link href="/parent/chores">
          <Button>Create Chore</Button>
        </Link>
        <Link href="/parent/rewards">
          <Button variant="secondary">Create Reward</Button>
        </Link>
        <Link href="/parent/settings">
          <Button variant="outline">Manage Profiles</Button>
        </Link>
      </div>

      {/* Kids Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Family Members
        </h2>

        {kidsWithStats.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No kids added yet.{' '}
                <Link
                  href="/parent/settings"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Add your first kid
                </Link>{' '}
                to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kidsWithStats.map(({ profile, points, todaysChores, incompleteChores, pendingReviews }) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{profile.name}</CardTitle>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {points} pts
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Today&apos;s chores:</span>
                      <span className="font-medium">{todaysChores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Incomplete:</span>
                      <span className="font-medium">{incompleteChores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pending review:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {pendingReviews}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Chore Reviews */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pending Chore Reviews
        </h2>

        {pendingChores.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No chores pending review
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingChores.map((chore: Chore) => {
              const assignedProfile = profileMap.get(chore.assignedToProfileId);
              const createdByProfile = profileMap.get(chore.createdByProfileId);

              return (
                <Card key={chore.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {chore.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Assigned to: {assignedProfile?.name || 'Unknown'}
                            </p>
                          </div>
                          <Badge variant="warning">Pending Review</Badge>
                        </div>
                        {chore.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {chore.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {chore.pointsValue} points
                          </span>
                          {chore.dueDate && (
                            <span>Due: {formatRelativeDate(chore.dueDate)}</span>
                          )}
                          <span>Created by: {createdByProfile?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ApproveChoreButton choreId={chore.id} />
                        <RejectChoreButton choreId={chore.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Reward Redemptions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pending Reward Redemptions
        </h2>

        {pendingRedemptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No redemptions pending approval
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRedemptions.map((redemption: RedemptionWithDetails) => {
              const profile = profileMap.get(redemption.profileId);

              return (
                <Card key={redemption.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {redemption.reward.pointsCost} points
                          </span>
                          <span>Requested: {formatRelativeDate(redemption.requestedAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ApproveRedemptionButton redemptionId={redemption.id} />
                        <RejectRedemptionButton redemptionId={redemption.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
