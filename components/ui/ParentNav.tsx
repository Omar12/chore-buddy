'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    const selectedProfileId = sessionStorage.getItem('selected_profile_id');
    if (selectedProfileId) {
      fetchProfileName(selectedProfileId);
    }
  }, []);

  const fetchProfileName = async (profileId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', profileId)
      .single();

    if (data) {
      setProfileName(data.name);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem('selected_profile_id');
    sessionStorage.removeItem('selected_profile_role');
    router.push('/auth/login');
  };

  const handleSwitchProfile = () => {
    sessionStorage.removeItem('selected_profile_id');
    sessionStorage.removeItem('selected_profile_role');
    router.push('/profile/select');
  };

  const navItems = [
    { href: '/parent/dashboard', label: 'Dashboard' },
    { href: '/parent/chores', label: 'Chores' },
    { href: '/parent/rewards', label: 'Rewards' },
    { href: '/parent/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Chore Buddy
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {profileName && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {profileName}
              </span>
            )}
            <button
              onClick={handleSwitchProfile}
              className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Switch Profile
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-gray-700 dark:text-white'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-4">
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              {profileName}
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <button
              onClick={handleSwitchProfile}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Switch Profile
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
