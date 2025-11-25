import { getProfiles } from '@/app/api/profiles/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getKidProfilesWithPoints } from '@/app/api/points/actions';
import ProfilesSection from './ProfilesSection';
import PointsAdjustmentSection from './PointsAdjustmentSection';

export default async function ParentSettingsPage() {
  const profiles = await getProfiles();
  const kidsWithPoints = await getKidProfilesWithPoints();

  const parentProfiles = profiles.filter(p => p.role !== 'kid');
  const kidProfiles = profiles.filter(p => p.role === 'kid');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage family profiles and settings
        </p>
      </div>

      {/* Parents/Helpers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Parents & Helpers
        </h2>
        <ProfilesSection profiles={parentProfiles} type="parent" />
      </div>

      {/* Kids Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Kids
        </h2>
        <ProfilesSection profiles={kidProfiles} type="kid" />
      </div>

      {/* Points Adjustment Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Points Adjustment
        </h2>
        <PointsAdjustmentSection kidsWithPoints={kidsWithPoints} />
      </div>
    </div>
  );
}
