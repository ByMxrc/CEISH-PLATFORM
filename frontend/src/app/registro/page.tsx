import Link from 'next/link';
import { RegisterForm } from '@/components/auth-form';

export default function RegisterPage() {
  return <main className="auth-shell">
    <section className="brand-panel"><h1>Solicitud de cuenta</h1><p>El registro público está disponible solo para investigadores internos y externos. La solicitud requiere aprobación del CEISH.</p></section>
    <section className="form-panel"><h2>Crea tu solicitud</h2><p className="muted">Los miembros CEISH y administradores son gestionados por la administración del sistema.</p><RegisterForm /><p className="muted">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>.</p></section>
  </main>;
}
