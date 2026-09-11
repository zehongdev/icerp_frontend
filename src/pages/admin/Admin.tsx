import { useMemo, useState } from 'react'
import {
    Plus, Search, X, ChevronLeft, ChevronRight, Pencil, Trash2,
    Ban, CheckCircle2, KeyRound, Users, ShieldCheck, ShieldOff, Clock,
    MoreHorizontal, Mail, Phone,
} from 'lucide-react'
import { UserFormDialog } from './AdminEdit'
import { toast } from 'sonner'

/* ═══════════ 类型 ═══════════ */

type UserRole = 'admin' | 'buyer' | 'warehouse' | 'viewer'
type UserStatus = 'active' | 'disabled' | 'pending'

type User = {
    id: string
    name: string
    email: string
    phone: string
    role: UserRole
    department: string
    status: UserStatus
    lastLogin: string | null
    createdAt: string
}

/* ═══════════ 角色配置 ═══════════ */

const ROLE_META: Record<UserRole, { label: string; cls: string }> = {
    admin: { label: '管理员', cls: 'bg-violet-400/10 text-violet-400 border-violet-400/25' },
    buyer: { label: '采购员', cls: 'bg-sky-400/10 text-sky-400 border-sky-400/25' },
    warehouse: { label: '仓储员', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25' },
    viewer: { label: '只读', cls: 'bg-white/5 text-(--text-soft) border-(--border)' },
}

const STATUS_META: Record<UserStatus, { label: string; cls: string; dot: string }> = {
    active: { label: '已启用', cls: 'text-emerald-400', dot: 'bg-emerald-400' },
    disabled: { label: '已停用', cls: 'text-(--muted)', dot: 'bg-zinc-500' },
    pending: { label: '待激活', cls: 'text-amber-400', dot: 'bg-amber-400' },
}

const ROLE_ORDER: UserRole[] = ['admin', 'buyer', 'warehouse', 'viewer']

/* ═══════════ 头像渐变(复用采购页逻辑) ═══════════ */

const AVATAR_GRADIENTS = [
    'from-sky-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-cyan-400 to-sky-500',
]

function pickGradient(name: string) {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973
    return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    const gradient = pickGradient(name)
    const sizeCls = size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-[13px]'
    return (
        <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white ${sizeCls}`}>
            {name.slice(0, 1)}
        </span>
    )
}

/* ═══════════ Mock 数据 ═══════════ */

const MOCK_USERS: User[] = [
    { id: 'u1', name: '李哲', email: 'lizhe@icerp.com', phone: '138 0000 1234', role: 'admin', department: '采购部', status: 'active', lastLogin: '2026-09-11 08:15', createdAt: '2024-03-12' },
    { id: 'u2', name: '张倩', email: 'zhangqian@icerp.com', phone: '139 0000 5678', role: 'buyer', department: '采购部', status: 'active', lastLogin: '2026-09-10 17:42', createdAt: '2024-05-08' },
    { id: 'u3', name: '王强', email: 'wangqiang@icerp.com', phone: '137 0000 9012', role: 'buyer', department: '采购部', status: 'active', lastLogin: '2026-09-11 09:03', createdAt: '2024-06-20' },
    { id: 'u4', name: '陈明', email: 'chenming@icerp.com', phone: '136 0000 3456', role: 'warehouse', department: '仓储部', status: 'active', lastLogin: '2026-09-11 07:50', createdAt: '2024-07-15' },
    { id: 'u5', name: '刘洋', email: 'liuyang@icerp.com', phone: '135 0000 7890', role: 'warehouse', department: '仓储部', status: 'disabled', lastLogin: '2026-08-20 16:30', createdAt: '2024-08-02' },
    { id: 'u6', name: '赵敏', email: 'zhaomin@icerp.com', phone: '134 0000 2345', role: 'viewer', department: '财务部', status: 'active', lastLogin: '2026-09-09 11:20', createdAt: '2025-01-10' },
    { id: 'u7', name: '孙涛', email: 'suntao@icerp.com', phone: '133 0000 6789', role: 'buyer', department: '采购部', status: 'pending', lastLogin: null, createdAt: '2026-09-08' },
    { id: 'u8', name: '周丽', email: 'zhouli@icerp.com', phone: '132 0000 1122', role: 'warehouse', department: '仓储部', status: 'pending', lastLogin: null, createdAt: '2026-09-09' },
    { id: 'u9', name: '吴刚', email: 'wugang@icerp.com', phone: '131 0000 3344', role: 'viewer', department: '财务部', status: 'disabled', lastLogin: '2026-07-15 10:00', createdAt: '2024-11-25' },
]

/* ═══════════ 工具 ═══════════ */

function formatRelative(iso: string | null): string {
    if (!iso) return '从未登录'
    const d = new Date(iso)
    const now = new Date('2026-09-11T10:00:00')
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
    if (diff < 60) return `${diff} 分钟前`
    if (diff < 60 * 24) return `${Math.floor(diff / 60)} 小时前`
    if (diff < 60 * 24 * 7) return `${Math.floor(diff / 60 / 24)} 天前`
    return iso.slice(0, 10)
}

function getPageNumbers(current: number, total: number): (number | 'gap')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | 'gap')[] = [1]
    const left = Math.max(2, current - 1)
    const right = Math.min(total - 1, current + 1)
    if (left > 2) pages.push('gap')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < total - 1) pages.push('gap')
    pages.push(total)
    return pages
}

/* ═══════════ 徽章 ═══════════ */

function RoleChip({ role }: { role: UserRole }) {
    const m = ROLE_META[role]
    return (
        <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>
            {m.label}
        </span>
    )
}

function StatusDot({ status }: { status: UserStatus }) {
    const m = STATUS_META[status]
    return (
        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${m.cls}`}>
            <span className={`size-1.5 rounded-full ${m.dot}`} />
            {m.label}
        </span>
    )
}

/* ═══════════ 统计卡片 ═══════════ */

function StatCard({
    icon: Icon, label, value, hint, accent, valueColor = 'text-(--text)',
}: {
    icon: typeof Users
    label: string
    value: string
    hint: string
    accent: string
    valueColor?: string
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--panel) px-4 py-4 transition-colors hover:border-(--border-strong)">
            <span className={`absolute inset-y-0 left-0 w-0.5 ${accent}`} />
            <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-(--border) bg-white/3 text-(--muted)">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-(--muted)">{label}</p>
                    <p className={`mt-1 text-[24px] font-bold leading-none ${valueColor}`}>{value}</p>
                    <p className="mt-1.5 text-[12px] text-(--muted)">{hint}</p>
                </div>
            </div>
        </div>
    )
}

/* ═══════════ 主页面 ═══════════ */

function AdminUsersPage() {
    const [activeRole, setActiveRole] = useState<UserRole | 'all'>('all')
    const [keyword, setKeyword] = useState('')
    const [page, setPage] = useState(1)

    // AdminUsersPage 里
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const pageSize = 10

    /* ── 筛选 ── */
    const filtered = useMemo(() => {
        return MOCK_USERS.filter((u) => {
            if (activeRole !== 'all' && u.role !== activeRole) return false
            if (keyword.trim()) {
                const kw = keyword.trim().toLowerCase()
                const hit =
                    u.name.toLowerCase().includes(kw) ||
                    u.email.toLowerCase().includes(kw) ||
                    u.phone.replace(/\s/g, '').includes(kw.replace(/\s/g, '')) ||
                    u.department.toLowerCase().includes(kw)
                if (!hit) return false
            }
            return true
        })
    }, [activeRole, keyword])

    /* ── 各角色数量 ── */
    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = { all: MOCK_USERS.length }
        ROLE_ORDER.forEach((r) => { counts[r] = MOCK_USERS.filter((u) => u.role === r).length })
        return counts
    }, [])

    /* ── 统计 ── */
    const stats = useMemo(() => ({
        total: MOCK_USERS.length,
        admins: MOCK_USERS.filter((u) => u.role === 'admin').length,
        disabled: MOCK_USERS.filter((u) => u.status === 'disabled').length,
        pending: MOCK_USERS.filter((u) => u.status === 'pending').length,
    }), [])

    /* ── 分页 ── */
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
    const pageNumbers = getPageNumbers(safePage, totalPages)

    const switchRole = (r: UserRole | 'all') => { setActiveRole(r); setPage(1) }

    /* ── 操作(占位) ── */
    const handleToggleStatus = (u: User) => {
        const next = u.status === 'active' ? '停用' : '启用'
        if (!window.confirm(`确定要${next}「${u.name}」的账号吗？`)) return
        toast.success(`已${next} ${u.name}`)
    }

    const handleDelete = (u: User) => {
        if (!window.confirm(`确定要删除「${u.name}」吗？此操作不可撤销。`)) return
        toast.success(`已删除 ${u.name}`)
    }

    const handleResetPwd = (u: User) => {
        if (!window.confirm(`确定要为「${u.name}」重置密码吗？`)) return
        toast.success(`已重置 ${u.name} 的密码，新密码已发送至邮箱`)
    }

    return (
        <div className="flex flex-col gap-5 pb-8">
            <UserFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                editingUserId={editingUser?.id}
                currentUserId="u1"          // 当前登录用户
                existingEmails={MOCK_USERS.map((u) => u.email)}
                initialValues={editingUser ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    phone: editingUser.phone,
                    role: editingUser.role,
                    department: editingUser.department,
                } : undefined}
                onSubmit={async (values) => {
                    if (dialogMode === 'create') {
                        // await api.users.create(values)
                        toast.success(`用户 ${values.name} 已创建`)
                    } else {
                        // await api.users.update(editingUser!.id, values)
                        toast.success('用户信息已更新')
                    }
                }}
            />
            {/* ══ 页头 ══ */}
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-(--text)">用户与权限</h1>
                    <p className="mt-1.5 text-[14px] text-(--muted)">管理员工账号、角色与访问权限</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-2.5 text-[14px] font-semibold text-(--bg-soft) transition-opacity hover:opacity-90"
                    onClick={() => {
                        setDialogMode('create')
                        setEditingUser(null)
                        setDialogOpen(true)
                    }}
                >
                    <Plus size={16} />
                    新建用户
                </button>
            </header>

            {/* ══ 统计 ══ */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="总用户" value={String(stats.total)} hint="所有账号" accent="bg-sky-400" valueColor="text-sky-400" />
                <StatCard icon={ShieldCheck} label="管理员" value={String(stats.admins)} hint="拥有完整权限" accent="bg-violet-400" valueColor="text-violet-400" />
                <StatCard icon={ShieldOff} label="已停用" value={String(stats.disabled)} hint="无法登录" accent="bg-zinc-500" valueColor="text-(--text-soft)" />
                <StatCard icon={Clock} label="待激活" value={String(stats.pending)} hint="等待首次登录" accent="bg-amber-400" valueColor="text-amber-400" />
            </div>

            {/* ══ 主区块 ══ */}
            <section className="flex flex-col rounded-[18px] border border-(--border) bg-(--panel) shadow-[0_10px_24px_var(--shadow)]">

                {/* Tab + 搜索 */}
                <div className="flex flex-wrap items-center gap-3 border-b border-(--border) px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => switchRole('all')}
                            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${activeRole === 'all' ? 'bg-(--accent)/12 text-(--accent)' : 'text-(--muted) hover:bg-white/5 hover:text-(--text)'
                                }`}
                        >
                            全部
                            <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${activeRole === 'all' ? 'bg-(--accent)/20 text-(--accent)' : 'bg-white/8 text-(--text-soft)'
                                }`}>{roleCounts.all}</span>
                        </button>

                        {ROLE_ORDER.map((r) => {
                            const active = activeRole === r
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => switchRole(r)}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${active ? 'bg-(--accent)/12 text-(--accent)' : 'text-(--muted) hover:bg-white/5 hover:text-(--text)'
                                        }`}
                                >
                                    {ROLE_META[r].label}
                                    <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${active ? 'bg-(--accent)/20 text-(--accent)' : 'bg-white/8 text-(--text-soft)'
                                        }`}>{roleCounts[r]}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-(--border) bg-(--surface-2) px-3.5 transition-colors focus-within:border-(--accent)">
                        <Search size={16} className="shrink-0 text-(--muted)" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
                            placeholder="搜索姓名、邮箱、手机号、部门..."
                            className="w-72 bg-transparent text-[14px] text-(--text) outline-none placeholder:text-(--muted)"
                        />
                        {keyword && (
                            <button
                                type="button"
                                onClick={() => { setKeyword(''); setPage(1) }}
                                className="shrink-0 text-(--muted) hover:text-(--text)"
                                aria-label="清除"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 表格 */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13.5px]">
                        <thead>
                            <tr className="border-b border-(--border) bg-black/10">
                                {[
                                    { label: '用户', align: 'left' },
                                    { label: '角色', align: 'left' },
                                    { label: '部门', align: 'left' },
                                    { label: '联系方式', align: 'left' },
                                    { label: '状态', align: 'left' },
                                    { label: '最后登录', align: 'left' },
                                    { label: '操作', align: 'right' },
                                ].map((col) => (
                                    <th
                                        key={col.label}
                                        className={`whitespace-nowrap px-3 py-3.5 text-[12px] font-medium text-(--muted) ${col.align === 'right' ? 'text-right' : 'text-left'
                                            }`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-20 text-center text-(--muted)">没有匹配的用户</td>
                                </tr>
                            ) : (
                                pageData.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="group border-b border-(--border)/60 transition-colors last:border-b-0 hover:bg-(--accent)/4"
                                    >
                                        {/* 用户 */}
                                        <td className="whitespace-nowrap px-3 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.name} />
                                                <div className="min-w-0">
                                                    <div className="text-[13.5px] font-semibold text-(--text)">{u.name}</div>
                                                    <div className="mt-0.5 text-[11.5px] text-(--muted)">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 角色 */}
                                        <td className="whitespace-nowrap px-3 py-3.5">
                                            <RoleChip role={u.role} />
                                        </td>

                                        {/* 部门 */}
                                        <td className="whitespace-nowrap px-3 py-3.5 text-(--text-soft)">{u.department}</td>

                                        {/* 联系方式 */}
                                        <td className="whitespace-nowrap px-3 py-3.5">
                                            <div className="flex flex-col gap-1 text-[12px] text-(--muted)">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Mail size={11} className="opacity-60" />
                                                    {u.email}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone size={11} className="opacity-60" />
                                                    <span className="font-mono">{u.phone}</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* 状态 */}
                                        <td className="whitespace-nowrap px-3 py-3.5">
                                            <StatusDot status={u.status} />
                                        </td>

                                        {/* 最后登录 */}
                                        <td className="whitespace-nowrap px-3 py-3.5 text-[12.5px] text-(--muted)">
                                            {formatRelative(u.lastLogin)}
                                        </td>

                                        {/* 操作 */}
                                        <td className="whitespace-nowrap px-3 py-3.5 text-right">
                                            <div className="inline-flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    className="grid size-8 place-items-center rounded-md text-(--muted) transition-colors hover:bg-(--operation)/15 hover:text-(--operation)"
                                                    title="编辑"
                                                    onClick={() => {
                                                        setDialogMode('edit')
                                                        setEditingUser(u)
                                                        setDialogOpen(true)
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleResetPwd(u)}
                                                    className="grid size-8 place-items-center rounded-md text-(--muted) transition-colors hover:bg-amber-400/15 hover:text-amber-400"
                                                    title="重置密码"
                                                >
                                                    <KeyRound size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(u)}
                                                    className={`grid size-8 place-items-center rounded-md text-(--muted) transition-colors ${u.status === 'active'
                                                        ? 'hover:bg-amber-400/15 hover:text-amber-400'
                                                        : 'hover:bg-emerald-400/15 hover:text-emerald-400'
                                                        }`}
                                                    title={u.status === 'active' ? '停用' : '启用'}
                                                >
                                                    {u.status === 'active' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(u)}
                                                    className="grid size-8 place-items-center rounded-md text-(--muted) transition-colors hover:bg-(--destructive)/15 hover:text-(--destructive)"
                                                    title="删除"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 分页 */}
                {filtered.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border) px-4 py-3.5">
                        <p className="text-[13px] text-(--muted)">
                            共 <span className="font-semibold text-(--text-soft)">{filtered.length}</span> 个用户
                            {totalPages > 1 && (
                                <>
                                    <span className="mx-2 opacity-40">·</span>
                                    第 {safePage} / {totalPages} 页
                                </>
                            )}
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={safePage === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="grid size-9 place-items-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-white/5 hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="上一页"
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                {pageNumbers.map((n, i) =>
                                    n === 'gap' ? (
                                        <span key={`gap-${i}`} className="px-2 text-(--muted)">…</span>
                                    ) : (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setPage(n)}
                                            className={`grid size-9 place-items-center rounded-lg text-[13.5px] font-medium transition-colors ${n === safePage ? 'bg-(--accent) text-(--bg-soft)' : 'text-(--text-soft) hover:bg-white/5'
                                                }`}
                                            aria-current={n === safePage ? 'page' : undefined}
                                        >
                                            {n}
                                        </button>
                                    )
                                )}

                                <button
                                    type="button"
                                    disabled={safePage === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="grid size-9 place-items-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-white/5 hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="下一页"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}

export default AdminUsersPage

