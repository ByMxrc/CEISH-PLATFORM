import Link from 'next/link';
import { LoginForm } from '@/components/auth-form';

export default function LoginPage() {
  return <main className="auth-shell">
    <section className="brand-panel"><h1>CEISH ULEAM</h1><p>Plataforma para la gestión de evaluaciones éticas en investigaciones con seres humanos.</p></section>
    <section className="form-panel"><h2>Bienvenido</h2><p className="muted">Ingresa con tu cuenta aprobada.</p><LoginForm /><p className="muted">¿Eres investigador y aún no tienes cuenta? <Link href="/registro">Solicita tu acceso</Link>.</p></section>
  </main>;
}
