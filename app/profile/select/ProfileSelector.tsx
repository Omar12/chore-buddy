'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Profile } from '@/types';
import { Card } from '@/components/ui/Card';

interface ProfileSelectorProps {
  profiles: Profile[];
}

export default function ProfileSelector({ profiles }: ProfileSelectorProps) {
  const router = useRouter();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfileId(profile.id);

    // Store profile selection in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selected_profile_id', profile.id);
      sessionStorage.setItem('selected_profile_role', profile.role);
    }

    // Navigate based on role
    if (profile.role === 'kid') {
      router.push('/kid/dashboard');
    } else {
      router.push('/parent/dashboard');
    }
  };

  const adultProfiles = profiles.filter(p => p.role !== 'kid');
  const kidProfiles = profiles.filter(p => p.role === 'kid');

  const ProfileCard = ({ profile, gradient }: { profile: Profile; gradient: string }) => (
    <Card
      hoverable
      className={`text-center p-6 transition-all ${
        selectedProfileId === profile.id ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelectProfile(profile)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectProfile(profile);
          }
        }}
        className="w-full bg-transparent border-none cursor-pointer p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
        aria-label={`Select profile: ${profile.name}, ${profile.role}`}
      >
        <div className={`w-20 h-20 mx-auto mb-3 rounded-full ${gradient} flex items-center justify-center text-white text-2xl font-bold overflow-hidden`}>
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={80}
              height={80}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (profile.name || '?').charAt(0).toUpperCase()
          )}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-center">
          {profile.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1 text-center">
          {profile.role}
        </p>
      </button>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Who&apos;s using Chore Buddy?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select your profile to continue
          </p>
        </div>

        {adultProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Parents & Helpers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="group" aria-label="Parent and helper profiles">
              {adultProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} gradient="bg-gradient-to-br from-primary-400 to-primary-600" />
              ))}
            </div>
          </div>
        )}

        {kidProfiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Kids
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="group" aria-label="Kid profiles">
              {kidProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} gradient="bg-gradient-to-br from-secondary-400 to-secondary-600" />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
