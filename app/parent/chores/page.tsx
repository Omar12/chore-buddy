import { getChores } from '@/app/api/chores/actions';
import { getProfiles } from '@/app/api/profiles/actions';
import Button from '@/components/ui/Button';
import ChoresTable from './ChoresTable';
import CreateChoreButton from './CreateChoreButton';

export default async function ParentChoresPage() {
  const chores = await getChores();
  const profiles = await getProfiles();
  const kidProfiles = profiles.filter(p => p.role === 'kid');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chores
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and track all family chores
          </p>
        </div>
        <CreateChoreButton kidProfiles={kidProfiles} />
      </div>

      <ChoresTable chores={chores} profiles={profiles} kidProfiles={kidProfiles} />
    </div>
  );
}
