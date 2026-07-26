import { Dashboard } from '@/components/dashboard';
import { requireRole } from '@/lib/access-control';

export default async function InvestigatorPage() { return <Dashboard role="INVESTIGATOR" user={await requireRole('INVESTIGATOR')} />; }
