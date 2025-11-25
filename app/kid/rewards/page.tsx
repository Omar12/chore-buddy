import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/Card';
import { getActiveRewards, getRedemptions } from '@/app/api/rewards/actions';
import { getProfilePoints } from '@/app/api/points/actions';
import { getProfile } from '@/app/api/profiles/actions';
import RewardCard from './RewardCard';
import MyRedemptions from './MyRedemptions';

export default async function KidRewardsPage() {
  const profileId = cookies().get('selected_profile_id')?.value;

  if (!profileId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Profile not selected. Please select your profile first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [rewards, points, profile, allRedemptions] = await Promise.all([
    getActiveRewards(),
    getProfilePoints(profileId),
    getProfile(profileId),
    getRedemptions(),
  ]);

  // Filter redemptions for this kid
  const myRedemptions = allRedemptions.filter(r => r.profileId === profileId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Points */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Rewards Store
        </h1>
        <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">You have</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {points}
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">points</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Available Rewards
        </h2>

        {rewards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                No rewards available yet
              </p>
              <p className="text-sm text-gray-400">
                Ask your parents to add some rewards!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                currentPoints={points}
                profileId={profileId}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Redemptions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          My Redemption Requests
        </h2>
        <MyRedemptions redemptions={myRedemptions} />
      </div>
    </div>
  );
}
