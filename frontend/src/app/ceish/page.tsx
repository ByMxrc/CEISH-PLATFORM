import { Dashboard } from '@/components/dashboard';
import { requireRole } from '@/lib/access-control';

export default async function CeishPage() { return <Dashboard role="CEISH_MEMBER" user={await requireRole('CEISH_MEMBER')} />; }
