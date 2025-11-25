import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getChoresForKid } from '@/app/api/chores/actions';
import { getProfilePoints } from '@/app/api/points/actions';
import { getProfile } from '@/app/api/profiles/actions';
import ChoreCard from './ChoreCard';

export default async function KidDashboard() {
  // Get profile ID from session storage (this would be set in middleware)
  // For now, we'll use a placeholder approach
  const cookieStore = await cookies();
  const profileId = cookieStore.get('selected_profile_id')?.value;

  if (!profileId) {
    // In a real app, this would be handled by middleware
    // For now, we'll just show a message
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Profile not selected. Please select your profile first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [chores, points, profile] = await Promise.all([
    getChoresForKid(profileId),
    getProfilePoints(profileId),
    getProfile(profileId),
  ]);

  // Filter chores by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysChores = chores.filter(chore => {
    if (!chore.dueDate) return false;
    const dueDate = new Date(chore.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const overdueChores = chores.filter(chore => {
    if (!chore.dueDate) return false;
    const dueDate = new Date(chore.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime() && chore.status !== 'completed';
  });

  const upcomingChores = chores.filter(chore => {
    if (!chore.dueDate) return false;
    const dueDate = new Date(chore.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() > today.getTime() && chore.status !== 'completed';
  });

  const noDueDateChores = chores.filter(chore => !chore.dueDate && chore.status !== 'completed');

  // Check for recently completed chores
  const recentlyCompleted = chores.filter(chore => {
    if (chore.status !== 'completed') return false;
    const completedAt = chore.updatedAt ? new Date(chore.updatedAt) : null;
    if (!completedAt) return false;
    const hoursSinceCompleted = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompleted < 24; // Show if completed in last 24 hours
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Avatar and Points */}
      <div className="text-center mb-8">
        <div className="inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hi, {profile?.name}!
        </h1>
        <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {points}
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">points</span>
        </div>
      </div>

      {/* Success Message for Recently Completed Chores */}
      {recentlyCompleted.length > 0 && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Great job!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You&rsquo;ve completed {recentlyCompleted.length} chore{recentlyCompleted.length > 1 ? 's' : ''} recently!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Chores */}
      {overdueChores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            Overdue ({overdueChores.length})
          </h2>
          <div className="space-y-4">
            {overdueChores.map(chore => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Chores */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today&apos;s Chores ({todaysChores.length})
        </h2>
        {todaysChores.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No chores due today. Enjoy your free time! 🎮
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todaysChores.map(chore => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Chores */}
      {upcomingChores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Coming Up ({upcomingChores.length})
          </h2>
          <div className="space-y-4">
            {upcomingChores.slice(0, 3).map(chore => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </div>
          {upcomingChores.length > 3 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              +{upcomingChores.length - 3} more upcoming chores
            </p>
          )}
        </div>
      )}

      {/* No Due Date Chores */}
      {noDueDateChores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Other Chores ({noDueDateChores.length})
          </h2>
          <div className="space-y-4">
            {noDueDateChores.map(chore => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {chores.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
              🎉 No chores assigned yet!
            </p>
            <p className="text-sm text-gray-400">
              Check back later for new chores
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
