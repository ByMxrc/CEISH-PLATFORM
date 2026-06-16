import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './src/server/apiPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar TODAS las variables de .env (sin prefijo) hacia process.env para
  // que el pool de PostgreSQL (lado servidor) pueda leerlas.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), apiPlugin()],
  }
})
