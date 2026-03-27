import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Use Chore Buddy',
  description: 'Learn how to set up and use Chore Buddy to manage family chores and rewards.',
};

const steps = [
  {
    number: 1,
    title: 'Create Your Account',
    icon: '👤',
    description: 'Sign up with your email and password to create a family account.',
    details: [
      'Go to the registration page and enter your details',
      'Your account automatically creates a new family group',
      'You\'ll be the first parent in the family',
    ],
  },
  {
    number: 2,
    title: 'Set Up Family Profiles',
    icon: '👨‍👩‍👧‍👦',
    description: 'Create profiles for each family member — parents and kids.',
    details: [
      'From the parent dashboard, go to Settings',
      'Add a profile for each child with their name and avatar',
      'Add other parents or helpers who can manage chores',
    ],
  },
  {
    number: 3,
    title: 'Create Chores',
    icon: '🧹',
    description: 'Set up chores with point values and assign them to kids.',
    details: [
      'Go to the Chores page and click "Add Chore"',
      'Give it a title, description, and point value',
      'Assign it to a child and set an optional due date',
    ],
  },
  {
    number: 4,
    title: 'Kids Complete Chores',
    icon: '✅',
    description: 'Kids log in, see their chores, and mark them as done.',
    details: [
      'Kids select their profile after signing in',
      'They see assigned chores on their dashboard',
      'They mark chores as done and submit for review',
    ],
  },
  {
    number: 5,
    title: 'Parents Review & Approve',
    icon: '👍',
    description: 'Parents review completed chores and approve them to award points.',
    details: [
      'Completed chores appear as "Pending Review" on the parent dashboard',
      'Review the work and approve to award points',
      'Points are automatically added to the child\'s balance',
    ],
  },
  {
    number: 6,
    title: 'Set Up Rewards',
    icon: '🎁',
    description: 'Create rewards that kids can redeem with their earned points.',
    details: [
      'Go to the Rewards page and click "Add Reward"',
      'Set a name, description, and point cost',
      'Examples: extra screen time, a treat, a fun outing',
    ],
  },
  {
    number: 7,
    title: 'Kids Redeem Rewards',
    icon: '🌟',
    description: 'Kids browse available rewards and request them using their points.',
    details: [
      'Kids visit the Rewards page from their dashboard',
      'They can request any reward they have enough points for',
      'Parents approve the request and the reward is redeemed',
    ],
  },
];

const tips = [
  {
    icon: '💡',
    title: 'Start Small',
    text: 'Begin with 2-3 simple chores and a couple of rewards. Add more as your family gets comfortable.',
  },
  {
    icon: '⚖️',
    title: 'Balance Point Values',
    text: 'Harder chores should be worth more points. A quick task might be 5 points while a bigger job could be 20+.',
  },
  {
    icon: '🔄',
    title: 'Keep It Fresh',
    text: 'Rotate chores and add new rewards regularly to keep kids motivated and engaged.',
  },
  {
    icon: '🎯',
    title: 'Set Clear Expectations',
    text: 'Use the chore description to explain exactly what "done" looks like so there are no surprises at review time.',
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
          >
            &larr; Back to Home
          </Link>
          <Link
            href="/auth/register"
            className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            How to Use Chore Buddy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A step-by-step guide to setting up your family&apos;s chore and reward system.
          </p>
        </div>

        {/* Steps */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex gap-5"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="text-primary-600 dark:text-primary-400 mr-2">
                      Step {step.number}.
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1 pt-1">
                    {step.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tips for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles overview */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Who Does What?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🧑‍💼</span> Parents
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">&#10003;</span>
                  Create and manage family profiles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">&#10003;</span>
                  Create chores and assign them to kids
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">&#10003;</span>
                  Review and approve completed chores
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">&#10003;</span>
                  Set up rewards and approve redemptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">&#10003;</span>
                  Adjust points manually if needed
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">👧</span> Kids
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 mt-0.5">&#10003;</span>
                  View assigned chores on their dashboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 mt-0.5">&#10003;</span>
                  Mark chores as in-progress and done
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 mt-0.5">&#10003;</span>
                  Submit chores for parent review
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 mt-0.5">&#10003;</span>
                  Check their points balance
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500 mt-0.5">&#10003;</span>
                  Browse and request rewards
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to Get Started?</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create your free account and set up your family in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors w-full sm:w-auto"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-lg font-semibold border-2 border-primary-600 dark:border-primary-400 transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
