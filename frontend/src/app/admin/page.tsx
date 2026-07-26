import { Dashboard } from '@/components/dashboard';
import { requireRole } from '@/lib/access-control';

export default async function AdminPage() { return <Dashboard role="ADMIN" user={await requireRole('ADMIN')} />; }
