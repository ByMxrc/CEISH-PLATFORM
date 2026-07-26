'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ApiError, SessionUser, UserDetail, UserListData, UserType } from '@/lib/types';

const labels: Record<UserType, string> = { INVESTIGATOR: 'Investigador', CEISH_MEMBER: 'Miembro CEISH', ADMIN: 'Administrador' };
const statuses = ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'] as const;

function errorMessage(payload: ApiError) {
  return Array.isArray(payload.message) ? payload.message.join('. ') : payload.message ?? 'No fue posible completar la operacion';
}

function statusLabel(status: SessionUser['accountStatus']) {
  return ({ PENDING_APPROVAL: 'Pendiente', ACTIVE: 'Activa', REJECTED: 'Rechazada', SUSPENDED: 'Suspendida' } as const)[status];
}

export function Dashboard({ role, user }: { role: UserType; user: SessionUser }) {
  const router = useRouter();
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); }

  return <div className="app-shell"><header className="topbar"><h1>CEISH ULEAM</h1><nav className="topbar-actions"><Link href="/perfil" className="button secondary">Mi perfil</Link><button className="button secondary" onClick={logout}>Cerrar sesion</button></nav></header><main className="dashboard"><h2>Panel de {labels[role]}</h2><p className="muted">Sesion activa para {user.name} ({user.email}).</p><section className="card"><h3>Acceso habilitado</h3><p>Tu cuenta se encuentra {statusLabel(user.accountStatus).toLowerCase()} y solo muestra las funciones autorizadas para tu rol.</p></section>{role === 'ADMIN' && <AdminUsersPanel />}</main></div>;
}

function AdminUsersPanel() {
  const [data, setData] = useState<UserListData>({ users: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [filters, setFilters] = useState({ search: '', accountStatus: '', userType: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(nextPage = page) {
    setLoading(true); setError('');
    const query = new URLSearchParams({ page: String(nextPage), limit: '10' });
    if (filters.search) query.set('search', filters.search);
    if (filters.accountStatus) query.set('accountStatus', filters.accountStatus);
    if (filters.userType) query.set('userType', filters.userType);
    const response = await fetch(`/api/admin/users?${query}`);
    const payload = await response.json() as ApiError & { data?: UserListData };
    if (!response.ok || !payload.data) setError(errorMessage(payload)); else setData(payload.data);
    setLoading(false);
  }

  useEffect(() => { void load(page); }, [page]);

  async function viewUser(id: string) {
    const response = await fetch(`/api/admin/users/${id}`);
    const payload = await response.json() as ApiError & { data?: UserDetail };
    if (!response.ok || !payload.data) { setError(errorMessage(payload)); return; }
    setSelected(payload.data); setReason('');
  }

  async function action(id: string, actionName: 'approve' | 'reject' | 'suspend') {
    if ((actionName === 'reject' && reason.trim().length < 10) || (actionName === 'suspend' && !reason.trim())) {
      setError(actionName === 'reject' ? 'La observacion de rechazo debe tener al menos 10 caracteres.' : 'Indica el motivo de la suspension.'); return;
    }
    const response = await fetch(`/api/admin/users/${id}/${actionName}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: actionName === 'approve' ? '{}' : JSON.stringify({ reason: reason.trim() }),
    });
    const payload = await response.json() as ApiError;
    if (!response.ok) { setError(errorMessage(payload)); return; }
    setSelected(null); setReason(''); await load(page);
  }

  function submitFilters(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); void load(1); }

  return <section className="card admin-users"><h3>Administracion de usuarios</h3><form className="filters" onSubmit={submitFilters}><input aria-label="Buscar por nombre o correo" placeholder="Buscar por nombre o correo" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><select aria-label="Filtrar por estado" value={filters.accountStatus} onChange={(event) => setFilters({ ...filters, accountStatus: event.target.value })}><option value="">Todos los estados</option>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select><select aria-label="Filtrar por tipo" value={filters.userType} onChange={(event) => setFilters({ ...filters, userType: event.target.value })}><option value="">Todos los tipos</option><option value="INVESTIGATOR">Investigador</option><option value="CEISH_MEMBER">Miembro CEISH</option><option value="ADMIN">Administrador</option></select><button className="button" type="submit">Filtrar</button></form>{error && <p className="notice error" role="alert">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Estado</th><th>Creada</th><th>Accion</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Cargando usuarios...</td></tr> : data.users.length === 0 ? <tr><td colSpan={6}>No se encontraron usuarios.</td></tr> : data.users.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td>{labels[item.userType]}</td><td>{statusLabel(item.accountStatus)}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-EC') : '-'}</td><td><button className="button secondary" onClick={() => void viewUser(item.id)}>Ver detalle</button></td></tr>)}</tbody></table></div><div className="pagination"><span>{data.pagination.total} usuario(s)</span><button className="button secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Pagina {page} de {data.pagination.totalPages || 1}</span><button className="button secondary" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Siguiente</button></div>{selected && <aside className="user-detail" aria-live="polite"><div className="detail-heading"><h4>Detalle de {selected.name}</h4><button className="button secondary" onClick={() => setSelected(null)}>Cerrar</button></div><p><strong>Correo:</strong> {selected.email}</p><p><strong>Tipo:</strong> {labels[selected.userType]}</p><p><strong>Estado:</strong> {statusLabel(selected.accountStatus)}</p>{selected.investigatorProfile && <p><strong>Perfil investigador:</strong> {selected.investigatorProfile.investigatorType === 'INTERNAL' ? 'Interno' : 'Externo'} · {selected.investigatorProfile.institution ?? 'Sin institucion'}</p>}{selected.ceishMemberProfile && <p><strong>Perfil CEISH:</strong> {selected.ceishMemberProfile.memberType === 'INTERNAL' ? 'Interno' : 'Externo'} · {selected.ceishMemberProfile.specialization ?? 'Sin especialidad'}</p>}<h5>Historial de cuenta</h5><ul>{selected.accountHistory.length === 0 ? <li>Sin eventos registrados.</li> : selected.accountHistory.map((event, index) => <li key={`${event.eventType}-${event.occurredAt}-${index}`}><strong>{event.newStatus ? statusLabel(event.newStatus as SessionUser['accountStatus']) : event.eventType}</strong> — {new Date(event.occurredAt).toLocaleString('es-EC')}{event.reason ? `: ${event.reason}` : ''}</li>)}</ul>{selected.accountStatus === 'PENDING_APPROVAL' && <div className="actions"><button className="button" onClick={() => void action(selected.id, 'approve')}>Aprobar</button><input aria-label="Observacion de rechazo" placeholder="Observacion de rechazo (minimo 10 caracteres)" value={reason} onChange={(event) => setReason(event.target.value)} /><button className="button danger" onClick={() => void action(selected.id, 'reject')}>Rechazar</button></div>}{selected.accountStatus === 'ACTIVE' && <div className="actions"><input aria-label="Motivo de suspension" placeholder="Motivo de suspension" value={reason} onChange={(event) => setReason(event.target.value)} /><button className="button danger" onClick={() => void action(selected.id, 'suspend')}>Suspender cuenta</button></div>}</aside>}</section>;
}
