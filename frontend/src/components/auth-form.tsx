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
  const [investigatorType, setInvestigatorType] = useState('INTERNAL');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password'), identificationNumber: form.get('identificationNumber'), investigatorType: form.get('investigatorType'), institution: form.get('institution') }) });
    const payload = await response.json() as ApiError;
    setLoading(false);
    if (!response.ok) { setError(messageFrom(payload)); return; }
    event.currentTarget.reset();
    setSuccess('Tu solicitud fue enviada. Podrás iniciar sesión cuando un administrador apruebe tu cuenta.');
  }

  if (success) {
    return <section className="registration-success" role="status" aria-live="polite">
      <div className="success-check" aria-hidden="true"><svg viewBox="0 0 52 52"><path d="M14 27l8 8 16-18" /></svg></div>
      <h3>Solicitud creada</h3>
      <p>{success}</p>
      <button className="button secondary" type="button" onClick={() => setSuccess('')}>Registrar otra cuenta</button>
    </section>;
  }

  return <form className="form" onSubmit={submit}>
    <label className="field">Nombre completo<input name="name" required minLength={3} autoComplete="name" /></label>
    <label className="field">Correo electrónico<input name="email" type="email" required autoComplete="email" /></label>
    <label className="field">Numero de cedula<input name="identificationNumber" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required /></label>
    <p className="muted">La cedula se valida automaticamente antes de enviar la solicitud.</p>
    <label className="field">Tipo de investigador<select name="investigatorType" required value={investigatorType} onChange={(event) => setInvestigatorType(event.target.value)}><option value="INTERNAL">Investigador interno ULEAM</option><option value="EXTERNAL">Investigador externo</option></select></label>
    {investigatorType === 'EXTERNAL' && <label className="field">Institucion o universidad<input name="institution" required minLength={2} autoComplete="organization" /></label>}
    <label className="field">Contraseña<input name="password" type="password" required minLength={8} autoComplete="new-password" /><span className="muted">Mínimo 8 caracteres.</span></label>
    <button className="button" disabled={loading}>{loading ? 'Enviando…' : 'Solicitar cuenta'}</button>
    {error && <p className="notice error" role="alert">{error}</p>}
  </form>;
}
