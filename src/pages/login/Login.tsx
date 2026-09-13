import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLanguage } from '../../app/providers/useLanguage'
import { loginUser } from '../../features/auth/api'

function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: true,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const email = form.email.trim()
    const password = form.password

    if (!email || !password) {
      setError('邮箱和密码不能为空。')
      toast.error('登录失败', {
        description: '邮箱和密码不能为空。',
      })
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await loginUser({ email, password, rememberMe: form.rememberMe })
      toast.success('登录成功', {
        description: '欢迎回来，已进入 ERP 控制台。',
      })
      navigate('/', { replace: true })
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : '登录失败，请重试。'
      setError(message)
      toast.error('登录失败', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[#2d2a2e] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative flex min-h-[35vh] overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(120,220,232,0.12),rgba(171,157,242,0.06)),linear-gradient(180deg,#2b2a2d_0%,#1f1d1f_100%)] p-8 sm:p-12 lg:min-h-screen lg:border-r lg:border-b-0 lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(169,220,118,0.12),transparent_32%)]" />

        <div className="relative z-10 flex w-full flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-cyan-300 to-violet-400 text-lg font-extrabold text-[#221f22]">
              I
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ICERP</h1>
              <p className="mt-1 text-sm text-slate-400">{t('enterpriseSuite')}</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {t('runBusiness')}
            </h2>
            <div className="mt-6 h-px w-16 bg-cyan-300" />
          </div>
        </div>
      </section>

      <section className="flex min-h-[65vh] items-center justify-center bg-[#363437] p-8 sm:p-12 lg:min-h-screen lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              {t('signIn')}
            </p>
            <h2 className="text-3xl font-bold text-white">{t('loginHeader')}</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="block text-xs font-medium text-slate-200">{t('email')}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-[#312d2f] px-3.5 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-medium text-slate-200">{t('password')}</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-[#312d2f] px-3.5 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 accent-cyan-300"
                />
                <span>{t('rememberMe')}</span>
              </label>
              <button type="button" className="text-sm font-medium text-cyan-300 transition hover:text-violet-300">
                {t('forgotPassword')}
              </button>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-white">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-linear-to-r from-cyan-300 to-lime-300 px-4 py-3.5 text-base font-bold text-[#221f22] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? '登录中...' : t('signIn')}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-5 text-sm text-slate-400">
            <span>登录方式</span>
            <strong className="text-slate-200">真实后端账号</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
