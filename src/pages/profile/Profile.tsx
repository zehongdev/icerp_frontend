import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { logoutUser } from '../../features/auth/api'
import { readAuthSession, saveAuthSession } from '../../features/auth/session'

const cardCls =
  'rounded-2xl border border-white/10 bg-(--panel) p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-6'

const labelCls = 'flex flex-col gap-2 text-xs text-(--text-soft)'

const inputCls =
  'h-10 w-full rounded-[10px] border border-white/10 bg-(--surface-2) px-3 text-(--text) outline-none transition-colors placeholder:text-(--text-soft)/60 focus:border-(--accent) focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50'

function ProfilePage() {
  const navigate = useNavigate()
  const session = readAuthSession()

  const [username, setUsername] = useState(session?.username ?? '')
  const [phone, setPhone] = useState(session?.phone ?? '')
  const [currentPwd, setCurrentPwd] = useState('')
  const [nextPwd, setNextPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  const displayName = session?.username?.trim() || '未命名用户'
  const initial = displayName.slice(0, 2).toUpperCase()
  const role = session?.role ?? 'User'
  const email = session?.email ?? '—'
  const lastLogin = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '—'

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUsername = username.trim()
    const nextPhone = phone.trim()

    if (!nextUsername || !nextPhone) {
      toast.error('请填写用户名和手机号。')
      return
    }
    if (!session) {
      toast.error('当前登录会话不存在，请重新登录。')
      return
    }

    setSavingProfile(true)
    try {
      saveAuthSession({ ...session, username: nextUsername, phone: nextPhone })
      toast.success('个人资料已保存。')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentPwd || !nextPwd || !confirmPwd) {
      toast.error('请填写全部密码字段。')
      return
    }
    if (nextPwd.length < 8) {
      toast.error('新密码至少 8 位。')
      return
    }
    if (nextPwd !== confirmPwd) {
      toast.error('两次输入的新密码不一致。')
      return
    }
    if (currentPwd === nextPwd) {
      toast.error('新密码不能与当前密码相同。')
      return
    }

    setSavingPwd(true)
    try {
      // TODO: 接入后端修改密码接口
      toast.success('密码修改请求已提交。')
      setCurrentPwd('')
      setNextPwd('')
      setConfirmPwd('')
    } finally {
      setSavingPwd(false)
    }
  }

  const handleLogout = async () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true)
      window.setTimeout(() => setConfirmingLogout(false), 3000)
      return
    }
    try {
      await logoutUser()
      navigate('/login', { replace: true })
    } catch {
      toast.error('退出失败，请重试。')
      setConfirmingLogout(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-5">
      <header className="">
        <p className="mb-1 uppercase tracking-[0.12em] text-(--txt-color-muted) text-xs">Account</p>
        <h1 className="text-3xl tracking-tight">个人资料</h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* ============ 左栏:身份 + 登出 ============ */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
          <div className={`${cardCls} flex flex-col items-center gap-4 text-center`}>
            <div className="grid size-20 place-items-center rounded-full bg-(--select) text-xl font-extrabold text-(--txt-color-primary) ring-4 ring-white/5">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-(--text)">{displayName}</h2>
              <p className="mt-1 text-sm text-(--muted)">{role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${confirmingLogout
              ? 'border-(--destructive) bg-(--destructive) text-white hover:brightness-110'
              : 'border-(--destructive)/30 text-(--destructive) hover:bg-(--destructive)/10'
              }`}
          >
            <LogOut size={16} />
            {confirmingLogout ? '确认退出？' : '退出登录'}
          </button>
        </aside>

        {/* ============ 右栏:表单 ============ */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* 基本信息 */}
          <section className={cardCls}>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-(--text)">基本信息</h3>
              <p className="mt-1 text-sm text-(--muted)">更新您的公开资料和联系方式。</p>
            </div>
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleProfileSave}>
              <label className={labelCls}>
                <span>用户名</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="请输入用户名"
                  className={inputCls}
                />
              </label>
              <label className={labelCls}>
                <span>手机号</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="请输入手机号"
                  className={inputCls}
                />
              </label>
              <label className={`${labelCls} md:col-span-2`}>
                <span>邮箱（由管理员维护，不可修改）</span>
                <input type="email" value={email} disabled className={inputCls} />
              </label>
              <div className="flex justify-end md:col-span-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-[10px] bg-(--select) px-4 py-2.5 text-sm font-bold text-(--txt-color-primary) transition-opacity disabled:opacity-50"
                >
                  {savingProfile ? '保存中…' : '保存资料'}
                </button>
              </div>
            </form>
          </section>

          {/* 账号安全 */}
          <section className={cardCls}>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-(--text)">账号安全</h3>
              <p className="mt-1 text-sm text-(--muted)">管理会话状态和登录凭据。</p>
            </div>

            <dl className="m-0 mb-7 grid gap-3.5">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2.5">
                <dt className="text-sm text-(--muted)">最后登录</dt>
                <dd className="m-0 text-sm font-semibold text-(--text)">{lastLogin}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2.5">
                <dt className="text-sm text-(--muted)">会话状态</dt>
                <dd className="m-0 inline-flex items-center gap-2 text-sm font-semibold text-(--text)">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Active
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-(--muted)">访问权限</dt>
                <dd className="m-0 text-sm font-semibold text-(--text)">
                  {role === 'Admin' ? 'Full admin' : 'Standard access'}
                </dd>
              </div>
            </dl>

            <div className=" pt-6">
              <h4 className="mb-4 text-sm font-semibold text-(--text)">修改密码</h4>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePasswordSave}>
                <label className={`${labelCls} md:col-span-2`}>
                  <span>当前密码</span>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    autoComplete="current-password"
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  <span>新密码</span>
                  <input
                    type="password"
                    value={nextPwd}
                    onChange={(e) => setNextPwd(e.target.value)}
                    autoComplete="new-password"
                    placeholder="至少 8 位"
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  <span>确认新密码</span>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </label>
                <div className="flex justify-end md:col-span-2">
                  <button
                    type="submit"
                    disabled={savingPwd}
                    className="rounded-[10px] border border-white/10 bg-(--surface-2) px-4 py-2.5 text-sm font-semibold text-(--text) transition-colors hover:border-(--accent) disabled:opacity-50"
                  >
                    {savingPwd ? '提交中…' : '修改密码'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage