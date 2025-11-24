import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-600 dark:text-primary-400">
            Chore Buddy
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
            Making family chores fun and rewarding
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Help your kids learn responsibility while earning rewards for their hard work.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors w-full sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-lg font-semibold border-2 border-primary-600 dark:border-primary-400 transition-colors w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-4xl mb-3">✓</div>
            <h3 className="font-semibold text-lg mb-2">Assign Chores</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create and assign chores to your kids with ease
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-semibold text-lg mb-2">Earn Points</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kids earn points for completing their chores
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-semibold text-lg mb-2">Get Rewards</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Redeem points for family rewards and treats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
