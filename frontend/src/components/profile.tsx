'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import type { ApiError, SessionUser } from '@/lib/types';

function messageFrom(response: ApiError) { return Array.isArray(response.message) ? response.message.join('. ') : response.message ?? 'No fue posible actualizar el perfil'; }

export function Profile({ user }: { user: SessionUser }) {
  const [current, setCurrent] = useState(user);
  const [message, setMessage] = useState('');
  const editable = current.userType === 'INVESTIGATOR' && current.investigatorProfile;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/users/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), institution: form.get('institution'), department: form.get('department'), phone: form.get('phone') }) });
    const payload = await response.json() as ApiError & { data?: SessionUser };
    if (!response.ok || !payload.data) { setMessage(messageFrom(payload)); return; }
    setCurrent(payload.data); setMessage('Perfil actualizado correctamente.');
  }

  return <div className="app-shell"><header className="topbar"><h1>CEISH ULEAM</h1><Link className="button secondary" href={current.userType === 'ADMIN' ? '/admin' : current.userType === 'CEISH_MEMBER' ? '/ceish' : '/investigador'}>Volver al panel</Link></header><main className="dashboard"><h2>Mi perfil</h2><section className="card profile-card"><p><strong>Correo:</strong> {current.email}</p><p><strong>Rol:</strong> {current.userType}</p><p><strong>Estado:</strong> {current.accountStatus}</p>{editable ? <form className="form" onSubmit={submit}><label className="field">Nombre completo<input name="name" defaultValue={current.name} /></label><label className="field">Institucion<input name="institution" defaultValue={current.investigatorProfile?.institution ?? ''} /></label><label className="field">Departamento<input name="department" defaultValue={current.investigatorProfile?.department ?? ''} /></label><label className="field">Telefono<input name="phone" defaultValue={current.investigatorProfile?.phone ?? ''} /></label><p className="muted">Tipo de investigador: {current.investigatorProfile?.investigatorType === 'INTERNAL' ? 'Interno' : 'Externo'}. Cedula: {current.investigatorProfile?.identificationNumber ?? 'No registrada'}.</p><button className="button">Guardar cambios</button></form> : <ProfileInformation user={current} />}{message && <p className="notice" role="status">{message}</p>}</section></main></div>;
}

function ProfileInformation({ user }: { user: SessionUser }) {
  if (user.ceishMemberProfile) return <><p><strong>Tipo de miembro CEISH:</strong> {user.ceishMemberProfile.memberType}</p><p><strong>Institucion:</strong> {user.ceishMemberProfile.institution ?? 'No registrada'}</p><p><strong>Especialidad:</strong> {user.ceishMemberProfile.specialization ?? 'No registrada'}</p><p><strong>Telefono:</strong> {user.ceishMemberProfile.phone ?? 'No registrado'}</p></>;
  return <p className="muted">Este perfil no cuenta con informacion institucional adicional.</p>;
}
