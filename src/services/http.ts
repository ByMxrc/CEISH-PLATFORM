// Helper de fetch compartido por todos los servicios del frontend.
// Centraliza el manejo de errores y el parseo de JSON.

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Error ${res.status} en ${path}`);
  }
  return res.json() as Promise<T>;
}
