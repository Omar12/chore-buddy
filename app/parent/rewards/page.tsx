import { getRewards, getRedemptions } from '@/app/api/rewards/actions';
import { getProfiles } from '@/app/api/profiles/actions';
import RewardsSection from './RewardsSection';
import RedemptionsSection from './RedemptionsSection';
import CreateRewardButton from './CreateRewardButton';

export default async function ParentRewardsPage() {
  const rewards = await getRewards();
  const redemptions = await getRedemptions();
  const profiles = await getProfiles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rewards
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage rewards catalog and redemption requests
          </p>
        </div>
        <CreateRewardButton />
      </div>

      {/* Rewards Catalog */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Rewards Catalog
        </h2>
        <RewardsSection rewards={rewards} />
      </div>

      {/* Redemption History */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Redemption History
        </h2>
        <RedemptionsSection redemptions={redemptions} profiles={profiles} />
      </div>
    </div>
  );
}
