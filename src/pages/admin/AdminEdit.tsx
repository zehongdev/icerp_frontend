import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Select } from 'radix-ui'
import {
    X, Loader2, ChevronDown, Eye, EyeOff, RefreshCw, Copy,
    Check, AlertCircle, ShieldCheck, User as UserIcon, KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'

/* ═══════════ 类型 ═══════════ */

export type UserRole = 'admin' | 'buyer' | 'warehouse' | 'viewer'

export type UserFormValues = {
    name: string
    email: string
    phone: string
    role: UserRole
    department: string
    password: string
}

type Mode = 'create' | 'edit'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: Mode
    /** 编辑模式传入初始值 */
    initialValues?: Partial<UserFormValues>
    /** 提交 */
    onSubmit?: (values: UserFormValues) => void | Promise<void>
    /** 已有邮箱列表(用于查重,编辑时排除自己) */
    existingEmails?: string[]
    /** 当前登录用户 id(编辑时若为自己,禁止改角色) */
    currentUserId?: string
    /** 编辑对象的 id */
    editingUserId?: string
}

/* ═══════════ 配置 ═══════════ */

const ROLE_META: Record<UserRole, { label: string; desc: string; cls: string }> = {
    admin: { label: '管理员', desc: '完整系统权限,含用户管理', cls: 'text-violet-400' },
    buyer: { label: '采购员', desc: '创建/编辑采购单,查看供应商', cls: 'text-sky-400' },
    warehouse: { label: '仓储员', desc: '入库/出库,查看库存', cls: 'text-emerald-400' },
    viewer: { label: '只读', desc: '仅查看,不可修改任何数据', cls: 'text-(--text-soft)' },
}

/** 角色 → 权限点(用于预览) */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['查看所有模块', '编辑采购单', '审批采购单', '管理供应商', '管理用户与权限'],
    buyer: ['查看采购/供应商', '创建采购单', '编辑草稿采购单', '提交审批'],
    warehouse: ['查看库存/采购', '执行入库', '执行出库', '库存盘点'],
    viewer: ['查看所有模块', '(不可编辑)'],
}

const DEPARTMENT_OPTIONS = [
    '采购部',
    '仓储部',
    '财务部',
    '销售部',
    '行政部',
    '技术部',
]

const ROLE_ORDER: UserRole[] = ['admin', 'buyer', 'warehouse', 'viewer']

/* ═══════════ 工具 ═══════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^1[3-9]\d{9}$/

/** 随机密码生成:大小写+数字+符号,16 位 */
function generatePassword(length = 16): string {
    const lower = 'abcdefghijkmnpqrstuvwxyz'
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const digits = '23456789'
    const symbols = '!@#$%^&*'
    const all = lower + upper + digits + symbols

    const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
    // 保证每类至少一个
    const seed = [pick(lower), pick(upper), pick(digits), pick(symbols)]
    const rest = Array.from({ length: length - seed.length }, () => pick(all))
    const arr = [...seed, ...rest]

    // Fisher-Yates 洗牌
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.join('')
}

/* ═══════════ 样式常量 ═══════════ */

const labelCls = 'flex flex-col gap-2 text-[12.5px] font-medium text-(--text-soft)'

const inputCls =
    'h-10 w-full rounded-[10px] border border-(--border) bg-(--surface-2) px-3 text-[13.5px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-(--accent) focus:ring-1 focus:ring-(--accent)'

const inputErrorCls =
    'h-10 w-full rounded-[10px] border border-rose-400/60 bg-(--surface-2) px-3 text-[13.5px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-rose-400 focus:ring-1 focus:ring-rose-400'

/* ═══════════ 下拉框(复用) ═══════════ */

function SelectField({
    value, onChange, options, placeholder, ariaLabel, disabled,
}: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    placeholder: string
    ariaLabel: string
    disabled?: boolean
}) {
    return (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
            <Select.Trigger
                aria-label={ariaLabel}
                className={`${inputCls} inline-flex items-center justify-between gap-2 data-placeholder:text-(--muted) disabled:cursor-not-allowed disabled:opacity-50`}
            >
                <Select.Value placeholder={placeholder} />
                <Select.Icon className="text-(--muted)">
                    <ChevronDown size={15} aria-hidden="true" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={6}
                    className="z-[1100] min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--border) bg-(--panel) shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
                >
                    <Select.Viewport className="flex flex-col gap-0.5 p-1.5">
                        {options.map((opt) => (
                            <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-[13.5px] text-(--text-soft) outline-none transition-colors data-[highlighted]:bg-(--accent)/12 data-[highlighted]:text-(--accent) data-[state=checked]:bg-(--accent)/15 data-[state=checked]:font-medium data-[state=checked]:text-(--accent)"
                            >
                                <Select.ItemText>{opt.label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}

/* ═══════════ 主组件 ═══════════ */

const EMPTY_FORM: UserFormValues = {
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
    department: '采购部',
    password: '',
}

export function UserFormDialog({
    open,
    onOpenChange,
    mode,
    initialValues,
    onSubmit,
    existingEmails = [],
    currentUserId,
    editingUserId,
}: Props) {
    const [form, setForm] = useState<UserFormValues>(EMPTY_FORM)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [showPwd, setShowPwd] = useState(false)



    const isEdit = mode === 'edit'
    const isSelf = isEdit && currentUserId === editingUserId
    const title = isEdit ? '编辑用户' : '新建用户'

    /* ── 打开时初始化 ── */
    useEffect(() => {
        if (!open) return
        if (isEdit && initialValues) {
            setForm({ ...EMPTY_FORM, ...initialValues, password: '' })
        } else {
            setForm({ ...EMPTY_FORM, password: generatePassword() })
        }
        setErrors({})
        setShowPwd(false)
    }, [open, isEdit, initialValues])

    /* ── 字段更新 ── */
    const setField = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => {
            if (!prev[key]) return prev
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setField(e.target.name as keyof UserFormValues, e.target.value as never)
    }

    /* ── 密码强度 ── */
    const pwdStrength = useMemo(() => {
        const p = form.password
        if (!p) return { level: 0, label: '', cls: '' }
        let score = 0
        if (p.length >= 8) score++
        if (p.length >= 12) score++
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
        if (/\d/.test(p)) score++
        if (/[^a-zA-Z0-9]/.test(p)) score++

        if (score <= 2) return { level: 1, label: '弱', cls: 'bg-rose-400' }
        if (score <= 3) return { level: 2, label: '中', cls: 'bg-amber-400' }
        return { level: 3, label: '强', cls: 'bg-emerald-400' }
    }, [form.password])

    /* ── 校验 ── */
    const validate = (v: UserFormValues): Record<string, string> => {
        const errs: Record<string, string> = {}

        if (!v.name.trim()) errs.name = '请填写姓名'
        else if (v.name.trim().length > 20) errs.name = '姓名不能超过 20 字'

        if (!v.email.trim()) errs.email = '请填写邮箱'
        else if (!EMAIL_RE.test(v.email.trim())) errs.email = '邮箱格式不正确'
        else {
            const normalized = v.email.trim().toLowerCase()
            const conflict = existingEmails
                .map((e) => e.toLowerCase())
                .filter((e) => !isEdit || e !== initialValues?.email?.toLowerCase())
            if (conflict.includes(normalized)) errs.email = '该邮箱已被使用'
        }

        if (v.phone.trim() && !PHONE_RE.test(v.phone.replace(/\s/g, ''))) {
            errs.phone = '手机号格式不正确'
        }

        if (!isEdit && v.password.length < 8) {
            errs.password = '密码至少 8 位'
        }

        return errs
    }

    /* ── 提交 ── */
    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault()
        if (saving) return

        const errs = validate(form)
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            toast.error('请检查表单', { description: `有 ${Object.keys(errs).length} 处需要修改` })
            return
        }

        setSaving(true)
        try {
            await onSubmit?.({
                ...form,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
            })
            onOpenChange(false)
        } catch (err) {
            toast.error(isEdit ? '保存失败' : '创建失败', {
                description: err instanceof Error ? err.message : '请稍后重试',
            })
        } finally {
            setSaving(false)
        }
    }

    /* ── 复制密码 ── */
    const copyPassword = async () => {
        try {
            await navigator.clipboard.writeText(form.password)
            toast.success('密码已复制到剪贴板')
        } catch {
            toast.error('复制失败,请手动选择')
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_150ms_ease-in]" />

                <Dialog.Content
                    aria-describedby={undefined}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault()
                        // 聚焦第一个输入框
                        const input = (e.currentTarget as HTMLElement)?.querySelector<HTMLInputElement>('input[name="name"]')
                        input?.focus()
                    }}
                    className="fixed left-1/2 top-1/2 z-[1000] flex max-h-[88vh] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--panel) shadow-[0_24px_60px_rgba(0,0,0,0.5)] outline-none data-[state=open]:animate-[dialog-in_220ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[dialog-out_160ms_ease-in]"
                >
                    {/* ══ 头部 ══ */}
                    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-(--border) px-5 py-4">
                        <div>
                            <Dialog.Title className="text-[17px] font-bold text-(--text)">
                                {title}
                            </Dialog.Title>
                            <p className="mt-0.5 text-[12.5px] text-(--muted)">
                                {isEdit ? '修改用户信息与权限' : '创建新员工账号并设置初始权限'}
                            </p>
                        </div>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="grid size-8 place-items-center rounded-lg text-(--muted) transition-colors hover:bg-white/5 hover:text-(--text)"
                                aria-label="关闭"
                            >
                                <X size={16} />
                            </button>
                        </Dialog.Close>
                    </header>

                    {/* ══ 主体(滚动) ══ */}
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                            <div className="flex flex-col gap-5">

                                {/* ── 基本信息 ── */}
                                <section className="flex flex-col gap-4">
                                    <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-(--text)">
                                        <UserIcon size={14} className="text-(--muted)" />
                                        基本信息
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className={labelCls}>
                                            <span>
                                                姓名 <span className="text-rose-400">*</span>
                                            </span>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="例:李哲"
                                                autoComplete="off"
                                                className={errors.name ? inputErrorCls : inputCls}
                                            />
                                            {errors.name && <FieldError msg={errors.name} />}
                                        </label>

                                        <label className={labelCls}>
                                            <span>
                                                邮箱 <span className="text-rose-400">*</span>
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="例:lizhe@icerp.com"
                                                autoComplete="off"
                                                className={errors.email ? inputErrorCls : inputCls}
                                            />
                                            {errors.email && <FieldError msg={errors.email} />}
                                        </label>

                                        <label className={labelCls}>
                                            <span>手机号</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="例:138 0000 1234"
                                                autoComplete="off"
                                                className={`${errors.phone ? inputErrorCls : inputCls} font-mono`}
                                            />
                                            {errors.phone && <FieldError msg={errors.phone} />}
                                        </label>

                                        <label className={labelCls}>
                                            <span>部门</span>
                                            <SelectField
                                                value={form.department}
                                                onChange={(v) => setField('department', v)}
                                                options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
                                                placeholder="请选择部门"
                                                ariaLabel="部门"
                                            />
                                        </label>
                                    </div>
                                </section>

                                {/* ── 权限 ── */}
                                <section className="flex flex-col gap-4 rounded-[12px] border border-(--border) bg-(--surface-2)/40 px-4 py-4">
                                    <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-(--text)">
                                        <ShieldCheck size={14} className="text-(--muted)" />
                                        权限
                                    </h3>

                                    <label className={labelCls}>
                                        <span>
                                            角色 <span className="text-rose-400">*</span>
                                        </span>
                                        <SelectField
                                            value={form.role}
                                            onChange={(v) => setField('role', v as UserRole)}
                                            options={ROLE_ORDER.map((r) => ({
                                                value: r,
                                                label: `${ROLE_META[r].label} — ${ROLE_META[r].desc}`,
                                            }))}
                                            placeholder="请选择角色"
                                            ariaLabel="角色"
                                            disabled={isSelf}
                                        />
                                        {isSelf && (
                                            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-amber-400">
                                                <AlertCircle size={12} />
                                                不能修改自己的角色
                                            </span>
                                        )}
                                    </label>

                                    {/* 权限预览 */}
                                    <div className="rounded-[10px] border border-dashed border-(--border) bg-(--panel)/50 px-3.5 py-3">
                                        <p className="mb-2 text-[11.5px] font-medium text-(--muted)">
                                            <span className={ROLE_META[form.role].cls}>{ROLE_META[form.role].label}</span>
                                            {' '}拥有以下权限:
                                        </p>
                                        <ul className="flex flex-col gap-1">
                                            {ROLE_PERMISSIONS[form.role].map((p) => (
                                                <li key={p} className="inline-flex items-center gap-2 text-[12px] text-(--text-soft)">
                                                    <Check size={11} className="text-emerald-400" />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>

                                {/* ── 初始密码(仅新建) ── */}
                                {!isEdit && (
                                    <section className="flex flex-col gap-4 rounded-[12px] border border-(--border) bg-(--surface-2)/40 px-4 py-4">
                                        <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-(--text)">
                                            <KeyRound size={14} className="text-(--muted)" />
                                            初始密码
                                        </h3>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type={showPwd ? 'text' : 'password'}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleChange}
                                                        autoComplete="new-password"
                                                        className={`${errors.password ? inputErrorCls : inputCls} pr-10 font-mono`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPwd((v) => !v)}
                                                        className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-(--muted) transition-colors hover:text-(--text)"
                                                        aria-label={showPwd ? '隐藏密码' : '显示密码'}
                                                    >
                                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setField('password', generatePassword())}
                                                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-(--border) bg-(--panel) px-3 text-[12.5px] font-medium text-(--text) transition-colors hover:bg-white/5"
                                                    title="重新生成"
                                                >
                                                    <RefreshCw size={13} />
                                                    随机
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={copyPassword}
                                                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-(--border) bg-(--panel) px-3 text-[12.5px] font-medium text-(--text) transition-colors hover:bg-white/5"
                                                    title="复制"
                                                >
                                                    <Copy size={13} />
                                                    复制
                                                </button>
                                            </div>

                                            {errors.password && <FieldError msg={errors.password} />}

                                            {/* 强度条 */}
                                            {form.password && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-1 flex-1 gap-1">
                                                        {[1, 2, 3].map((lv) => (
                                                            <div
                                                                key={lv}
                                                                className={`flex-1 rounded-full transition-colors ${lv <= pwdStrength.level ? pwdStrength.cls : 'bg-white/8'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className={`text-[11px] font-medium ${ROLE_META[form.role].cls}`}>
                                                        {pwdStrength.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="inline-flex items-start gap-1.5 text-[11.5px] text-(--muted)">
                                            <AlertCircle size={12} className="mt-0.5 shrink-0 opacity-70" />
                                            该密码仅显示一次,请复制并安全地告知用户。用户首次登录时需强制修改。
                                        </p>
                                    </section>
                                )}

                                {/* ── 编辑模式的说明 ── */}
                                {isEdit && (
                                    <p className="inline-flex items-start gap-1.5 text-[11.5px] text-(--muted)">
                                        <AlertCircle size={12} className="mt-0.5 shrink-0 opacity-70" />
                                        如需重置该用户密码,请在用户列表中使用「重置密码」操作。
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ══ 底部固定操作 ══ */}
                        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-(--border) bg-(--panel) px-5 py-3.5">
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-[10px] border border-(--border) px-4 py-2.5 text-[13.5px] font-semibold text-(--text) transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    取消
                                </button>
                            </Dialog.Close>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-br from-(--accent) to-(--accent-strong) px-5 py-2.5 text-[13.5px] font-semibold text-(--bg-soft) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving && <Loader2 size={15} className="animate-spin" />}
                                {saving ? (isEdit ? '保存中…' : '创建中…') : (isEdit ? '保存' : '创建用户')}
                            </button>
                        </footer>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

/* ═══════════ 错误提示 ═══════════ */

function FieldError({ msg }: { msg: string }) {
    return (
        <span className="inline-flex items-center gap-1 text-[11.5px] text-rose-400">
            <AlertCircle size={11} />
            {msg}
        </span>
    )
}

export default UserFormDialog