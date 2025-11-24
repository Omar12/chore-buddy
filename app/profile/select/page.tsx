import { getProfiles } from '@/app/api/profiles/actions';
import { redirect } from 'next/navigation';
import ProfileSelector from './ProfileSelector';

export default async function ProfileSelectPage() {
  const profiles = await getProfiles();

  if (!profiles || profiles.length === 0) {
    redirect('/auth/login');
  }

  return <ProfileSelector profiles={profiles} />;
}
