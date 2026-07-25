'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiError, SessionUser } from '@/lib/types';

function messageFrom(response: ApiError) {
  return Array.isArray(response.message) ? response.message.join('. ') : response.message ?? response.error ?? 'No fue posible completar la solicitud';
}

function roleRoute(user: SessionUser) {
  if (user.userType === 'ADMIN') return '/admin';
  if (user.userType === 'CEISH_MEMBER') return '/ceish';
  return '/investigador';
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
    const payload = await response.json() as ApiError & { data?: { user: SessionUser } };
    setLoading(false);
    if (!response.ok || !payload.data) { setError(messageFrom(payload)); return; }
    router.replace(roleRoute(payload.data.user));
  }

  return <form className="form" onSubmit={submit}>
    <label className="field">Correo institucional o personal<input name="email" type="email" required autoComplete="email" /></label>
    <label className="field">Contraseña<input name="password" type="password" required minLength={8} autoComplete="current-password" /></label>
    <button className="button" disabled={loading}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</button>
    {error && <p className="notice error" role="alert">{error}</p>}
  </form>;
}

export function RegisterForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password'), investigatorType: form.get('investigatorType') }) });
    const payload = await response.json() as ApiError;
    setLoading(false);
    if (!response.ok) { setError(messageFrom(payload)); return; }
    event.currentTarget.reset();
    setSuccess('Tu solicitud fue enviada. Podrás iniciar sesión cuando un administrador apruebe tu cuenta.');
  }

  return <form className="form" onSubmit={submit}>
    <label className="field">Nombre completo<input name="name" required minLength={3} autoComplete="name" /></label>
    <label className="field">Correo electrónico<input name="email" type="email" required autoComplete="email" /></label>
    <label className="field">Tipo de investigador<select name="investigatorType" required defaultValue="INTERNAL"><option value="INTERNAL">Investigador interno ULEAM</option><option value="EXTERNAL">Investigador externo</option></select></label>
    <label className="field">Contraseña<input name="password" type="password" required minLength={8} autoComplete="new-password" /><span className="muted">Mínimo 8 caracteres.</span></label>
    <button className="button" disabled={loading}>{loading ? 'Enviando…' : 'Solicitar cuenta'}</button>
    {error && <p className="notice error" role="alert">{error}</p>}
    {success && <p className="notice success" role="status">{success}</p>}
  </form>;
}
