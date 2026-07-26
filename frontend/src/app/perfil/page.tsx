import { Profile } from '@/components/profile';
import { requireCurrentUser } from '@/lib/access-control';

export default async function ProfilePage() { return <Profile user={await requireCurrentUser()} />; }
