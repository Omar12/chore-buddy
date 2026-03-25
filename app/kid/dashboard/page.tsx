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
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hi, {profile?.name}!
        </h1>
        <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg animate-fade-in-up">
          <span className="text-4xl font-bold text-primary-600 dark:text-primary-400 animate-points-pop">
            {points}
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">points</span>
        </div>
      </div>

      {/* Success Message for Recently Completed Chores */}
      {recentlyCompleted.length > 0 && (
        <Card className="mb-6 border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20 animate-fade-in-up">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-gentle-bounce" aria-hidden="true">🎉</span>
              <div>
                <p className="font-semibold text-success-900 dark:text-success-100">
                  {recentlyCompleted.length === 1 ? 'Way to go!' : 'You\'re on fire!'}
                </p>
                <p className="text-sm text-success-700 dark:text-success-300">
                  {recentlyCompleted.length === 1
                    ? 'You completed a chore today — keep it up!'
                    : `${recentlyCompleted.length} chores done recently. That's amazing!`}
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
          <div className="space-y-4 stagger-children">
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
            <CardContent className="py-10 text-center">
              <div className="text-4xl mb-3 animate-gentle-bounce" aria-hidden="true">🎮</div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                No chores due today!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enjoy your free time — you&apos;ve earned it.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 stagger-children">
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
            <div className="text-5xl mb-4 animate-gentle-bounce" aria-hidden="true">🌟</div>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              All clear — no chores yet!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your parents haven&apos;t assigned any chores. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
