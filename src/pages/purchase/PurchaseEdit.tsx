import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Printer, Save, X, Loader2, ChevronDown,
    Package, Wallet, FileText, Info, Clock, TrendingUp, Building2, Sparkles,
} from 'lucide-react'
import { Select } from 'radix-ui'
import { toast } from 'sonner'

/* ═══════════ 类型 ═══════════ */

type OrderStatus = 'pending' | 'ordered' | 'shipping' | 'received'
type Mode = 'create' | 'edit'

type PurchaseFormValues = {
    supplier: string
    buyer: string
    orderDate: string
    expectedDate: string
    status: OrderStatus
    partNumber: string
    brand: string
    description: string
    silkscreen: string
    batch: string
    packageType: string
    qty: number | ''
    unitPrice: number | ''
    remark: string
}

/* ═══════════ 状态配置 ═══════════ */

const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
    pending: { label: '待审批', cls: 'bg-amber-400/10 text-amber-400 border-amber-400/25' },
    ordered: { label: '已下单', cls: 'bg-sky-400/10 text-sky-400 border-sky-400/25' },
    shipping: { label: '运输中', cls: 'bg-violet-400/10 text-violet-400 border-violet-400/25' },
    received: { label: '已入库', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25' },
}

/* ═══════════ 下拉选项 ═══════════ */

const SUPPLIER_OPTIONS = [
    'ST 官方代理 · 世强',
    'Murata 授权 · 大联大',
    'TI 代理 · 安富利',
    'Espressif 直采',
    '国巨代理 · 文晔',
    'NXP 代理 · 世强',
]

const BUYER_OPTIONS = ['李哲', '张倩', '王强', '陈明']

const PACKAGE_OPTIONS = [
    'LQFP-48', 'TSSOP-20', 'SOT-223', 'SOT-23', 'TO-263-5',
    'SOIC-8', 'SMD-38', '0603', '0402', '1206',
]

/* ═══════════ Mock:辅助栏数据 ═══════════ */

const RECENT_ITEMS = [
    { partNumber: 'STM32F103C8T6', brand: 'ST', packageType: 'LQFP-48', unitPrice: 14.20, description: 'ARM Cortex-M3 微控制器', silkscreen: 'STM32F103' },
    { partNumber: 'AMS1117-3.3', brand: 'AMS', packageType: 'SOT-223', unitPrice: 0.31, description: '3.3V 稳压器', silkscreen: 'AZ1117H' },
    { partNumber: 'GRM188R71H104KA93D', brand: 'Murata', packageType: '0603', unitPrice: 0.021, description: '0603 100nF 贴片电容', silkscreen: '—' },
    { partNumber: 'TJA1050T', brand: 'NXP', packageType: 'SOIC-8', unitPrice: 5.90, description: 'CAN 收发器', silkscreen: 'TJA1050' },
]

const COMMON_SUPPLIERS = [
    { name: 'ST 官方代理 · 世强', orders: 18, lastOrder: '2026-08-12' },
    { name: 'Murata 授权 · 大联大', orders: 12, lastOrder: '2026-08-09' },
    { name: 'TI 代理 · 安富利', orders: 9, lastOrder: '2026-08-15' },
]

/* ═══════════ Mock:编辑模式数据 ═══════════ */

const loadPurchase = (_id: string): PurchaseFormValues => ({
    supplier: 'ST 官方代理 · 世强',
    buyer: '李哲',
    orderDate: '2026-08-12',
    expectedDate: '2026-08-18',
    status: 'shipping',
    partNumber: 'STM32F103C8T6',
    brand: 'ST',
    description: 'ARM Cortex-M3 微控制器',
    silkscreen: 'STM32F103',
    batch: '2405-A18',
    packageType: 'LQFP-48',
    qty: 15000,
    unitPrice: 14.20,
    remark: '客户指定用原厂包装，货期务必准时。',
})

const PRICE_HISTORY = [
    { date: '2026-08-12', price: 14.20, qty: 15000 },
    { date: '2026-07-05', price: 14.50, qty: 12000 },
    { date: '2026-06-18', price: 14.20, qty: 20000 },
]

const AUDIT_LOG = [
    { who: '张倩', action: '将状态从「待审批」改为「运输中」', time: '08-13 14:22' },
    { who: '李哲', action: '将数量从 12000 改为 15000', time: '08-12 10:05' },
    { who: '李哲', action: '创建采购单', time: '08-12 09:48' },
]

/* ═══════════ 工具 ═══════════ */

const formatMoney = (n: number) =>
    '¥ ' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const EMPTY_FORM: PurchaseFormValues = {
    supplier: '',
    buyer: '李哲',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDate: '',
    status: 'pending',
    partNumber: '',
    brand: '',
    description: '',
    silkscreen: '',
    batch: '',
    packageType: '',
    qty: '',
    unitPrice: '',
    remark: '',
}

/* ═══════════ 通用样式 ═══════════ */

const labelCls = 'flex flex-col gap-2 text-[12.5px] font-medium text-(--text-soft)'

const inputCls =
    'h-10 w-full rounded-[10px] border border-(--border) bg-(--surface-2) px-3 text-[13.5px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-(--accent) focus:ring-1 focus:ring-(--accent)'

const inputErrorCls =
    'h-10 w-full rounded-[10px] border border-rose-400/60 bg-(--surface-2) px-3 text-[13.5px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-rose-400 focus:ring-1 focus:ring-rose-400'

/* ═══════════ 字段组 ═══════════ */

function FieldGroup({
    icon: Icon, title, children,
}: {
    icon: typeof Package
    title: string
    children: ReactNode
}) {
    return (
        <section className="flex flex-col gap-5 rounded-[14px] border border-(--border) bg-(--surface-2)/30 px-5 py-5">
            <h2 className="inline-flex items-center gap-2 text-[14px] font-semibold text-(--text)">
                <Icon size={15} className="text-(--muted)" />
                {title}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">{children}</div>
        </section>
    )
}

/* ═══════════ 下拉框 ═══════════ */

function SelectField({
    value, onChange, options, placeholder, ariaLabel,
}: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    placeholder: string
    ariaLabel: string
}) {
    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger
                aria-label={ariaLabel}
                className={`${inputCls} inline-flex items-center justify-between gap-2 data-placeholder:text-(--muted)`}
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
                    className="z-1000 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--border) bg-(--panel) shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
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

/* ═══════════ 侧边卡片 ═══════════ */

function SideCard({
    icon: Icon, title, children, action,
}: {
    icon: typeof Clock
    title: string
    children: ReactNode
    action?: ReactNode
}) {
    return (
        <div className="rounded-[14px] border border-(--border) bg-(--panel) p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-(--text)">
                    <Icon size={14} className="text-(--muted)" />
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </div>
    )
}

/* ═══════════ 右侧辅助栏 ═══════════ */

function SidePanel({
    mode, form, onPickItem, onPickSupplier,
}: {
    mode: Mode
    form: PurchaseFormValues
    onPickItem: (item: typeof RECENT_ITEMS[number]) => void
    onPickSupplier: (name: string) => void
}) {
    /* ── 新建模式 ── */
    if (mode === 'create') {
        return (
            <aside className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
                {/* 最近采购 —— 可一键填充 */}
                <SideCard
                    icon={Sparkles}
                    title="最近采购的物料"
                    action={<span className="text-[11px] text-(--muted)">点击填充</span>}
                >
                    <ul className="flex flex-col gap-1.5">
                        {RECENT_ITEMS.map((item) => (
                            <li key={item.partNumber}>
                                <button
                                    type="button"
                                    onClick={() => onPickItem(item)}
                                    className="w-full rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-(--border) hover:bg-white/5"
                                >
                                    <div className="font-mono text-[12.5px] font-semibold text-violet-300">
                                        {item.partNumber}
                                    </div>
                                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px]">
                                        <span className="truncate text-(--muted)">{item.description}</span>
                                        <span className="shrink-0 font-mono text-emerald-400">{formatMoney(item.unitPrice)}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </SideCard>

                {/* 常用供应商 */}
                <SideCard icon={Building2} title="常用供应商">
                    <ul className="flex flex-col gap-1.5">
                        {COMMON_SUPPLIERS.map((s) => (
                            <li key={s.name}>
                                <button
                                    type="button"
                                    onClick={() => onPickSupplier(s.name)}
                                    className="w-full rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-(--border) hover:bg-white/5"
                                >
                                    <div className="text-[12.5px] font-medium text-(--text)">{s.name}</div>
                                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-(--muted)">
                                        <span>{s.orders} 单</span>
                                        <span className="opacity-40">·</span>
                                        <span>最近 {s.lastOrder}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </SideCard>
            </aside>
        )
    }

    /* ── 编辑模式 ── */
    return (
        <aside className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
            {/* 当前供应商 */}
            <SideCard icon={Building2} title="当前供应商">
                <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-semibold text-(--text)">{form.supplier || '未选择'}</p>
                    <div className="flex flex-col gap-1 text-[11.5px] text-(--muted)">
                        <div className="flex justify-between">
                            <span>联系人</span>
                            <span className="text-(--text-soft)">张伟</span>
                        </div>
                        <div className="flex justify-between">
                            <span>电话</span>
                            <span className="font-mono text-(--text-soft)">138 0000 1234</span>
                        </div>
                        <div className="flex justify-between">
                            <span>合作年限</span>
                            <span className="text-(--text-soft)">3 年</span>
                        </div>
                    </div>
                </div>
            </SideCard>

            {/* 历史价格 —— 改单价的参考 */}
            <SideCard icon={TrendingUp} title="历史采购价格">
                {form.partNumber ? (
                    <ul className="flex flex-col gap-2">
                        {PRICE_HISTORY.map((p) => (
                            <li key={p.date} className="flex items-center justify-between gap-3 text-[11.5px]">
                                <span className="text-(--muted)">{p.date}</span>
                                <span className="font-mono text-(--text-soft)">×{p.qty.toLocaleString('zh-CN')}</span>
                                <span className={`font-mono font-semibold ${p.price === form.unitPrice ? 'text-emerald-400' : 'text-(--text)'
                                    }`}>
                                    {formatMoney(p.price)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[12px] text-(--muted)">填写型号后显示历史价格</p>
                )}
            </SideCard>

            {/* 修改记录 */}
            <SideCard icon={Clock} title="修改记录">
                <ul className="flex flex-col gap-3">
                    {AUDIT_LOG.map((log, i) => (
                        <li key={i} className="flex gap-2.5 text-[11.5px]">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-(--accent)/60" />
                            <div className="min-w-0">
                                <div className="text-(--text-soft)">{log.action}</div>
                                <div className="mt-0.5 text-[10.5px] text-(--muted)">
                                    {log.who} · {log.time}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </SideCard>
        </aside>
    )
}

/* ═══════════ 主页面 ═══════════ */

function PurchaseFormPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const mode: Mode = id ? 'edit' : 'create'

    const [form, setForm] = useState<PurchaseFormValues>(() =>
        mode === 'edit' ? loadPurchase(id!) : EMPTY_FORM
    )
    const [initial, setInitial] = useState<PurchaseFormValues | null>(() =>
        mode === 'edit' ? loadPurchase(id!) : null
    )
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    /* ── id 变化时重新加载(切换单据) ── */
    useEffect(() => {
        if (mode === 'edit' && id) {
            const data = loadPurchase(id)
            setForm(data)
            setInitial(data)
        } else {
            setForm(EMPTY_FORM)
            setInitial(null)
        }
    }, [id, mode])

    /* ── 总价 ── */
    const totalAmount = useMemo(() => {
        const qty = typeof form.qty === 'number' ? form.qty : 0
        const price = typeof form.unitPrice === 'number' ? form.unitPrice : 0
        return qty * price
    }, [form.qty, form.unitPrice])

    /* ── dirty 检测:新建模式视为始终 dirty ── */
    const isDirty = useMemo(() => {
        if (mode === 'create') {
            return JSON.stringify(form) !== JSON.stringify(EMPTY_FORM)
        }
        if (!initial) return false
        return JSON.stringify(form) !== JSON.stringify(initial)
    }, [form, initial, mode])

    /* ── 字段更新 ── */
    const setField = <K extends keyof PurchaseFormValues>(key: K, value: PurchaseFormValues[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => {
            if (!prev[key]) return prev
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        if (type === 'number') {
            setField(name as keyof PurchaseFormValues, (value === '' ? '' : Number(value)) as never)
        } else {
            setField(name as keyof PurchaseFormValues, value as never)
        }
    }

    /* ── 一键填充物料 ── */
    const handlePickItem = (item: typeof RECENT_ITEMS[number]) => {
        setForm((prev) => ({
            ...prev,
            partNumber: item.partNumber,
            brand: item.brand,
            description: item.description,
            silkscreen: item.silkscreen,
            packageType: item.packageType,
            unitPrice: item.unitPrice,
        }))
        toast.success(`已填充 ${item.partNumber}`)
    }

    const handlePickSupplier = (name: string) => {
        setField('supplier', name)
        toast.success(`已选择 ${name}`)
    }

    /* ── 校验 ── */
    const validate = (v: PurchaseFormValues): Record<string, string> => {
        const errs: Record<string, string> = {}
        if (!v.supplier.trim()) errs.supplier = '请选择供应商'
        if (!v.partNumber.trim()) errs.partNumber = '请填写型号'
        if (v.qty === '' || Number(v.qty) <= 0) errs.qty = '数量必须大于 0'
        if (v.unitPrice === '' || Number(v.unitPrice) < 0) errs.unitPrice = '请填写单价'
        if (v.expectedDate && v.orderDate && new Date(v.expectedDate) < new Date(v.orderDate)) {
            errs.expectedDate = '预计到货不能早于下单日期'
        }
        return errs
    }

    /* ── 保存 ── */
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
            // TODO: 接入后端新建/更新接口
            await new Promise((r) => setTimeout(r, 600))
            if (mode === 'create') {
                toast.success('采购单已创建')
            } else {
                setInitial(form)
                toast.success('采购单已保存')
            }
            navigate('/purchase')
        } catch {
            toast.error(mode === 'create' ? '创建失败，请重试' : '保存失败，请重试')
        } finally {
            setSaving(false)
        }
    }

    /* ── 取消 ── */
    const handleCancel = () => {
        if (isDirty && !window.confirm('有未保存的修改，确定离开吗？')) return
        navigate('/purchase')
    }

    const statusMeta = ORDER_STATUS[form.status]
    const isCreate = mode === 'create'

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-28">

            {/* ══ 页头 ══ */}
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] font-semibold text-(--muted) transition-colors hover:bg-white/5 hover:text-(--text)"
                    >
                        <ArrowLeft size={15} className="rounded-md border border-(--border) bg-white/5 p-0.5 text-(--text-soft)" />
                        <span>返回采购单</span>
                    </button>
                    <div>
                        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-(--muted)">Purchases</p>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-(--text)">
                                {isCreate ? '新建采购单' : '编辑采购单'}
                            </h1>
                            {!isCreate && (
                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-medium ${statusMeta.cls}`}>
                                    {statusMeta.label}
                                </span>
                            )}
                        </div>
                        {!isCreate && (
                            <p className="mt-1.5 font-mono text-[13px] text-(--muted)">{id}</p>
                        )}
                    </div>
                </div>
            </header>

            {/* ══ 主内容:左表单 + 右辅助栏 ══ */}
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

                {/* ── 左:表单 ── */}
                <div className="flex flex-col gap-5">

                    {/* 基本信息 */}
                    <FieldGroup icon={Info} title="基本信息">
                        <label className={labelCls}>
                            <span>
                                供应商 <span className="text-rose-400">*</span>
                            </span>
                            <SelectField
                                value={form.supplier}
                                onChange={(v) => setField('supplier', v)}
                                options={SUPPLIER_OPTIONS.map((s) => ({ value: s, label: s }))}
                                placeholder="请选择供应商"
                                ariaLabel="供应商"
                            />
                            {errors.supplier && <span className="text-[11.5px] text-rose-400">{errors.supplier}</span>}
                        </label>

                        <label className={labelCls}>
                            <span>采购员</span>
                            <SelectField
                                value={form.buyer}
                                onChange={(v) => setField('buyer', v)}
                                options={BUYER_OPTIONS.map((b) => ({ value: b, label: b }))}
                                placeholder="请选择采购员"
                                ariaLabel="采购员"
                            />
                        </label>

                        <label className={labelCls}>
                            <span>下单日期</span>
                            <input
                                type="date"
                                name="orderDate"
                                value={form.orderDate}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </label>

                        <label className={labelCls}>
                            <span>预计到货</span>
                            <input
                                type="date"
                                name="expectedDate"
                                value={form.expectedDate}
                                onChange={handleChange}
                                className={errors.expectedDate ? inputErrorCls : inputCls}
                            />
                            {errors.expectedDate && <span className="text-[11.5px] text-rose-400">{errors.expectedDate}</span>}
                        </label>

                        <label className={labelCls}>
                            <span>状态</span>
                            <SelectField
                                value={form.status}
                                onChange={(v) => setField('status', v as OrderStatus)}
                                options={(['pending', 'ordered', 'shipping', 'received'] as OrderStatus[]).map((s) => ({
                                    value: s,
                                    label: ORDER_STATUS[s].label,
                                }))}
                                placeholder="请选择状态"
                                ariaLabel="状态"
                            />
                        </label>
                    </FieldGroup>

                    {/* 物料信息 */}
                    <FieldGroup icon={Package} title="物料信息">
                        <label className={labelCls}>
                            <span>
                                型号 <span className="text-rose-400">*</span>
                            </span>
                            <input
                                type="text"
                                name="partNumber"
                                value={form.partNumber}
                                onChange={handleChange}
                                placeholder="例:STM32F103C8T6"
                                className={`${errors.partNumber ? inputErrorCls : inputCls} font-mono text-violet-300`}
                            />
                            {errors.partNumber && <span className="text-[11.5px] text-rose-400">{errors.partNumber}</span>}
                        </label>

                        <label className={labelCls}>
                            <span>品牌</span>
                            <input
                                type="text"
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="例:ST"
                                className={inputCls}
                            />
                        </label>

                        <label className={`${labelCls} lg:col-span-2`}>
                            <span>描述</span>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="例:ARM Cortex-M3 微控制器"
                                className={inputCls}
                            />
                        </label>

                        <label className={labelCls}>
                            <span>丝印</span>
                            <input
                                type="text"
                                name="silkscreen"
                                value={form.silkscreen}
                                onChange={handleChange}
                                placeholder="例:STM32F103"
                                className={`${inputCls} font-mono`}
                            />
                        </label>

                        <label className={labelCls}>
                            <span>批次</span>
                            <input
                                type="text"
                                name="batch"
                                value={form.batch}
                                onChange={handleChange}
                                placeholder="例:2405-A18"
                                className={`${inputCls} font-mono`}
                            />
                        </label>

                        <label className={labelCls}>
                            <span>封装</span>
                            <SelectField
                                value={form.packageType}
                                onChange={(v) => setField('packageType', v)}
                                options={PACKAGE_OPTIONS.map((p) => ({ value: p, label: p }))}
                                placeholder="请选择封装"
                                ariaLabel="封装"
                            />
                        </label>
                    </FieldGroup>

                    {/* 数量金额 */}
                    <FieldGroup icon={Wallet} title="数量金额">
                        <label className={labelCls}>
                            <span>
                                数量 <span className="text-rose-400">*</span>
                            </span>
                            <input
                                type="number"
                                name="qty"
                                min={0}
                                step={1}
                                value={form.qty}
                                onChange={handleChange}
                                placeholder="例:15000"
                                className={`${errors.qty ? inputErrorCls : inputCls} font-mono`}
                            />
                            {errors.qty && <span className="text-[11.5px] text-rose-400">{errors.qty}</span>}
                        </label>

                        <label className={labelCls}>
                            <span>
                                单价（未税） <span className="text-rose-400">*</span>
                            </span>
                            <input
                                type="number"
                                name="unitPrice"
                                min={0}
                                step={0.01}
                                value={form.unitPrice}
                                onChange={handleChange}
                                placeholder="例:14.20"
                                className={`${errors.unitPrice ? inputErrorCls : inputCls} font-mono`}
                            />
                            {errors.unitPrice && <span className="text-[11.5px] text-rose-400">{errors.unitPrice}</span>}
                        </label>

                        <div className={`${labelCls} lg:col-span-2`}>
                            <span>总价（自动计算）</span>
                            <div className="flex h-10 items-center justify-end rounded-[10px] border border-dashed border-(--border) bg-(--surface-2)/50 px-3">
                                <span className="font-mono text-[16px] font-bold text-emerald-400">
                                    {formatMoney(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </FieldGroup>

                    {/* 备注 */}
                    <FieldGroup icon={FileText} title="备注">
                        <label className={`${labelCls} lg:col-span-2`}>
                            <span>备注</span>
                            <textarea
                                name="remark"
                                value={form.remark}
                                onChange={handleChange}
                                rows={3}
                                placeholder="补充说明、特殊要求..."
                                className="min-h-24 w-full resize-none rounded-[10px] border border-(--border) bg-(--surface-2) px-3 py-2.5 text-[13.5px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-(--accent) focus:ring-1 focus:ring-(--accent)"
                            />
                        </label>
                    </FieldGroup>
                </div>

                {/* ── 右:辅助栏(按模式切换内容) ── */}
                <SidePanel
                    mode={mode}
                    form={form}
                    onPickItem={handlePickItem}
                    onPickSupplier={handlePickSupplier}
                />
            </div>

            {/* ══ 底部固定操作条 ══ */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border) bg-(--panel)/95 backdrop-blur-sm">
                <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        {isDirty && (
                            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-amber-400">
                                <span className="size-1.5 rounded-full bg-amber-400" />
                                {isCreate ? '未保存的新单' : '有未保存的修改'}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="mr-2 text-[12.5px] text-(--muted)">
                            总价 <span className="font-mono text-[14px] font-semibold text-emerald-400">{formatMoney(totalAmount)}</span>
                        </span>

                        {!isCreate && (
                            <button
                                type="button"
                                onClick={() => toast.info('打印功能开发中')}
                                className="inline-flex items-center gap-2 rounded-[10px] border border-(--border) bg-(--panel) px-3.5 py-2.5 text-[13.5px] font-medium text-(--text) transition-colors hover:bg-white/5"
                            >
                                <Printer size={15} />
                                打印
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-(--border) px-4 py-2.5 text-[13.5px] font-semibold text-(--text) transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={15} />
                            取消
                        </button>

                        <button
                            type="submit"
                            disabled={saving || (!isDirty && !isCreate)}
                            className="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-br from-(--accent) to-(--accent-strong) px-5 py-2.5 text-[13.5px] font-semibold text-(--bg-soft) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? (isCreate ? '创建中…' : '保存中…') : (isCreate ? '创建采购单' : '保存')}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PurchaseFormPage