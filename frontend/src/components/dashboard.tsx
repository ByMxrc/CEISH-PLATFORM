'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiError, SessionUser, UserType } from '@/lib/types';

const labels: Record<UserType, string> = { INVESTIGATOR: 'Investigador', CEISH_MEMBER: 'Miembro CEISH', ADMIN: 'Administrador' };

function errorMessage(payload: ApiError) {
  return Array.isArray(payload.message) ? payload.message.join('. ') : payload.message ?? 'No fue posible completar la operación';
}

export function Dashboard({ role }: { role: UserType }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let response = await fetch('/api/auth/session');
      if (response.status === 401) { await fetch('/api/auth/refresh', { method: 'POST' }); response = await fetch('/api/auth/session'); }
      if (!response.ok) { router.replace('/login'); return; }
      const payload = await response.json() as { data: SessionUser };
      if (payload.data.userType !== role) { router.replace(rolePath(payload.data.userType)); return; }
      setUser(payload.data); setLoading(false);
    }
    void load();
  }, [role, router]);

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); }

  if (loading || !user) return <main className="dashboard"><p className="muted">Validando tu sesión…</p></main>;
  return <div className="app-shell"><header className="topbar"><h1>CEISH ULEAM</h1><button className="button secondary" onClick={logout}>Cerrar sesión</button></header><main className="dashboard"><h2>Panel de {labels[role]}</h2><p className="muted">Sesión activa para {user.name} ({user.email}).</p><section className="card"><h3>Acceso habilitado</h3><p>Los módulos de investigaciones, estratificación y evaluación se incorporarán en una siguiente etapa.</p></section>{role === 'ADMIN' && <PendingAccounts />}</main></div>;
}

function rolePath(role: UserType) { return role === 'ADMIN' ? '/admin' : role === 'CEISH_MEMBER' ? '/ceish' : '/investigador'; }

function PendingAccounts() {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [error, setError] = useState('');
  const [reason, setReason] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch('/api/admin/users');
    const payload = await response.json() as ApiError & { data?: { users?: SessionUser[] } };
    if (!response.ok) { setError(errorMessage(payload)); return; }
    setUsers(payload.data?.users ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function approve(id: string) {
    const response = await fetch(`/api/admin/users/${id}/approve`, { method: 'POST' });
    if (!response.ok) { const payload = await response.json() as ApiError; setError(errorMessage(payload)); return; }
    await load();
  }
  async function reject(id: string) {
    const currentReason = reason[id] ?? '';
    if (currentReason.length < 10) { setError('La razón del rechazo debe tener al menos 10 caracteres.'); return; }
    const response = await fetch(`/api/admin/users/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: currentReason }) });
    if (!response.ok) { const payload = await response.json() as ApiError; setError(errorMessage(payload)); return; }
    await load();
  }

  return <section className="card"><h3>Solicitudes pendientes</h3><p className="muted">Aprueba o rechaza las solicitudes de investigadores.</p>{error && <p className="notice error">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Acción</th></tr></thead><tbody>{users.length === 0 ? <tr><td colSpan={3}>No hay solicitudes pendientes.</td></tr> : users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><div className="actions"><button className="button" onClick={() => approve(user.id)}>Aprobar</button><input aria-label={`Razón para rechazar a ${user.name}`} placeholder="Razón de rechazo" value={reason[user.id] ?? ''} onChange={(event) => setReason({ ...reason, [user.id]: event.target.value })} /><button className="button danger" onClick={() => reject(user.id)}>Rechazar</button></div></td></tr>)}</tbody></table></div></section>;
}
