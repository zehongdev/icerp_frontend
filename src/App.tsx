
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/query/queryClient'
import { useEffect, useState } from 'react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Minus, Square, X } from 'lucide-react'
import AppLayout from './app/layouts/AppLayout'
import { LanguageProvider } from './app/providers/LanguageProvider'
import { ConfirmProvider } from './components/alert-dialog/ConfirmDialog'
import { isAuthenticated } from './features/auth/session'
import LoginPage from './pages/login/Login'

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//       staleTime: 1000 * 60, // 1 minute
//     },
//   },
// })

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const electronApi = (window as Window & {
    electron?: {
      send: (channel: string, data?: unknown) => void
    }
  }).electron

  useEffect(() => {
    const syncAuthState = () => setAuthenticated(isAuthenticated())
    window.addEventListener('icerp-auth-session-changed', syncAuthState)

    return () => {
      window.removeEventListener('icerp-auth-session-changed', syncAuthState)
    }
  }, [])

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    electronApi?.send('window-control', action)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ConfirmProvider>
          <div className="flex h-screen flex-col overflow-hidden bg-(--bg-container)">
            <div className="flex h-10.5 shrink-0 items-center justify-between bg-(--bg-surface) px-3.5 [-webkit-app-region:drag]">
              <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
                <div className="size-2.5 rounded-full bg-linear-to-br from-sky-300 to-violet-400 shadow-[0_0_10px_rgba(125,211,252,0.5)]" aria-hidden="true" />
                <span className="text-xs font-bold tracking-[0.14em] text-white/90">ICERP</span>
              </div>

              <div className="flex items-center gap-1 [-webkit-app-region:no-drag]">
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-white/55 transition hover:bg-white/5 hover:text-white active:scale-[0.98]"
                  aria-label="Minimize"
                  onClick={() => handleWindowControl('minimize')}
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-white/55 transition hover:bg-white/5 hover:text-white active:scale-[0.98]"
                  aria-label="Maximize"
                  onClick={() => handleWindowControl('maximize')}
                >
                  <Square className="size-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-white/55 transition hover:bg-[#e81123] hover:text-white active:scale-[0.98]"
                  aria-label="Close"
                  onClick={() => handleWindowControl('close')}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <MemoryRouter initialEntries={[window.location.pathname || (authenticated ? '/' : '/login')]}>
                <Toaster position="bottom-right" richColors closeButton expand visibleToasts={4} />
                <Routes>
                  <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} />
                  <Route path="*" element={authenticated ? <AppLayout /> : <Navigate to="/login" replace />} />
                </Routes>
              </MemoryRouter>
            </div>
          </div>
        </ConfirmProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
