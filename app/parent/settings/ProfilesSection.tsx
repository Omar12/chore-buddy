'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Profile } from '@/types';
import CreateProfileButton from './CreateProfileButton';
import EditProfileButton from './EditProfileButton';
import DeleteProfileButton from './DeleteProfileButton';

interface ProfilesSectionProps {
  profiles: Profile[];
  type: 'parent' | 'kid';
}

export default function ProfilesSection({ profiles, type }: ProfilesSectionProps) {
  return (
    <div>
      <div className="mb-4">
        <CreateProfileButton type={type} />
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No {type === 'kid' ? 'kids' : 'parents/helpers'} added yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map(profile => (
            <Card key={profile.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {profile.name}
                    </h3>
                  </div>
                  <Badge variant={profile.role === 'owner' ? 'info' : 'default'}>
                    {profile.role}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-3">
                  <EditProfileButton profile={profile} />
                  {profile.role !== 'owner' && (
                    <DeleteProfileButton profileId={profile.id} profileName={profile.name} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
