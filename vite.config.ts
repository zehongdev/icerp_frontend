import { defineConfig, loadEnv } from 'vite'
// import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import react from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'
import electron from 'vite-plugin-electron/simple'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'development' && !env.VITE_API_PROXY_TARGET) {
    throw new Error('VITE_API_PROXY_TARGET must be set for development mode.')
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      // babel({ presets: [reactCompilerPreset()] }),
      electron({
        main: {
          entry: 'electron/main.ts',
        },
        preload: {
          input: 'electron/preload.ts',
        },
      }),
    ],
    base: './',
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
  }
})
