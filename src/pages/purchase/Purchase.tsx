// import { useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import {
//   Plus, Search, X, Download, ChevronLeft, ChevronRight,
//   Pencil, Trash2, Printer, Calendar, ClipboardList, Clock, PackageCheck, Handshake,
//   ArrowUpDown, Building2, User
// } from 'lucide-react'
// import { useLanguage } from '../../app/providers/useLanguage'

// /* ═══════════ 类型 ═══════════ */

// type OrderStatus = 'pending' | 'ordered' | 'shipping' | 'received'
// type ItemStatus = 'waiting' | 'partial' | 'received'

// type PurchaseRow = {
//   id: string
//   code: string
//   status: OrderStatus
//   supplier: string
//   buyer: string
//   date: string
//   partNumber: string
//   description: string
//   silkscreen: string
//   batch: string
//   packageType: string
//   brand: string
//   qty: number
//   unitPrice: number
//   itemStatus: ItemStatus
// }

// /* ═══════════ 状态配置 ═══════════ */

// const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string; bar: string }> = {
//   pending: { label: '待审批', cls: 'bg-amber-400/10 text-amber-400 border-amber-400/25', bar: 'bg-amber-400' },
//   ordered: { label: '已下单', cls: 'bg-sky-400/10 text-sky-400 border-sky-400/25', bar: 'bg-sky-400' },
//   shipping: { label: '运输中', cls: 'bg-violet-400/10 text-violet-400 border-violet-400/25', bar: 'bg-violet-400' },
//   received: { label: '已入库', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25', bar: 'bg-emerald-400' },
// }

// const ITEM_STATUS: Record<ItemStatus, { label: string; cls: string }> = {
//   waiting: { label: '待到货', cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
//   partial: { label: '部分到货', cls: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
//   received: { label: '已入库', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
// }

// /* ═══════════ 颜色语义 ═══════════ */

// const C_PRIMARY = 'text-(--text)'
// const C_SECONDARY = 'text-(--text-soft)'
// const C_MUTED = 'text-(--muted)'
// const C_PART = 'text-rose-300'


// /* ═══════════ Mock 数据 ═══════════ */

// const mkRow = (
//   id: string, code: string, status: OrderStatus, supplier: string,
//   buyer: string, date: string, partNumber: string, description: string,
//   silkscreen: string, batch: string, packageType: string, brand: string,
//   qty: number, unitPrice: number, itemStatus: ItemStatus,
// ): PurchaseRow => ({
//   id, code, status, supplier, buyer, date,
//   partNumber, description, silkscreen, batch, packageType, brand,
//   qty, unitPrice, itemStatus,
// })

// const MOCK_ROWS: PurchaseRow[] = [
//   mkRow('r1', 'PO-24-03312', 'shipping', 'ST 官方代理 · 世强', '李哲', '2026-08-12',
//     'STM32F103C8T6', 'ARM Cortex-M3 微控制器', 'STM32F103', '2405-A18', 'LQFP-48', 'ST',
//     15000, 14.20, 'waiting'),
//   mkRow('r2', 'PO-24-03312', 'shipping', 'ST 官方代理 · 世强', '李哲', '2026-08-12',
//     'STM32F030F4P6', '入门级 ARM MCU', 'STM32F030', '2405-A21', 'TSSOP-20', 'ST',
//     8000, 6.80, 'waiting'),
//   mkRow('r3', 'PO-24-03312', 'shipping', 'ST 官方代理 · 世强', '李哲', '2026-08-12',
//     'AMS1117-3.3', '3.3V 稳压器', 'AZ1117H', '2402-D15', 'SOT-223', 'AMS',
//     40000, 0.31, 'waiting'),
//   mkRow('r4', 'PO-24-03312', 'shipping', 'ST 官方代理 · 世强', '李哲', '2026-08-12',
//     'SS8050-J3Y', 'NPN 三极管 SOT-23', 'J3Y', '2405-B44', 'SOT-23', 'SS',
//     130000, 0.05, 'partial'),
//   mkRow('r5', 'PO-24-03311', 'shipping', 'Murata 授权 · 大联大', '李哲', '2026-08-09',
//     'GRM188R71H104KA93D', '0603 100nF 贴片电容', '—', '2406-B31', '0603', 'Murata',
//     2000000, 0.021, 'waiting'),
//   mkRow('r6', 'PO-24-03311', 'shipping', 'Murata 授权 · 大联大', '李哲', '2026-08-09',
//     'GRM155R71C104KA88D', '0402 100nF 贴片电容', '—', '2406-B40', '0402', 'Murata',
//     3000000, 0.016, 'waiting'),
//   mkRow('r7', 'PO-24-03311', 'shipping', 'Murata 授权 · 大联大', '李哲', '2026-08-09',
//     'GRM31CR71H475KA12L', '1206 4.7uF 贴片电容', '—', '2405-B12', '1206', 'Murata',
//     800000, 0.066, 'waiting'),
//   mkRow('r8', 'PO-24-03310', 'ordered', 'TI 代理 · 安富利', '张倩', '2026-08-15',
//     'LM2596S-ADJ', '降压 DC-DC 稳压芯片', 'LM2596S', '2403-A02', 'TO-263-5', 'TI',
//     30000, 2.90, 'waiting'),
//   mkRow('r9', 'PO-24-03310', 'ordered', 'TI 代理 · 安富利', '张倩', '2026-08-15',
//     'TPS54331DR', '3A 降压转换器', '54331', '2404-A50', 'SOIC-8', 'TI',
//     5000, 1.84, 'waiting'),
//   mkRow('r10', 'PO-24-03309', 'received', 'Espressif 直采', '李哲', '2026-08-06',
//     'ESP32-WROOM-32E', 'WiFi + 蓝牙模组', 'ESP32-D0WD', '2404-C07', 'SMD-38', 'Espressif',
//     8000, 17.80, 'received'),
//   mkRow('r11', 'PO-24-03309', 'received', 'Espressif 直采', '李哲', '2026-08-06',
//     'ESP32-S3-WROOM-1', 'WiFi + BLE 5.0 模组', 'ESP32-S3', '2404-C12', 'SMD-38', 'Espressif',
//     2000, 26.50, 'received'),
//   mkRow('r12', 'PO-24-03308', 'pending', '国巨代理 · 文晔', '王强', '2026-08-14',
//     'RC0603FR-0710KL', '0603 10KΩ 电阻', '—', '—', '0603', 'Yageo',
//     5000000, 0.0055, 'waiting'),
//   mkRow('r13', 'PO-24-03307', 'pending', 'NXP 代理 · 世强', '张倩', '2026-08-13',
//     'TJA1050T', 'CAN 收发器', 'TJA1050', '2403-C18', 'SOIC-8', 'NXP',
//     15000, 5.90, 'waiting'),
// ]

// /* ═══════════ 工具 ═══════════ */

// const formatMoney = (n: number) =>
//   '¥ ' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// const formatInt = (n: number) => n.toLocaleString('zh-CN')

// const formatDate = (iso: string) => {
//   const d = new Date(iso)
//   return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
// }

// function getPageNumbers(current: number, total: number): (number | 'gap')[] {
//   if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
//   const pages: (number | 'gap')[] = [1]
//   const left = Math.max(2, current - 1)
//   const right = Math.min(total - 1, current + 1)
//   if (left > 2) pages.push('gap')
//   for (let i = left; i <= right; i++) pages.push(i)
//   if (right < total - 1) pages.push('gap')
//   pages.push(total)
//   return pages
// }

// /* ═══════════ 状态徽章 ═══════════ */

// function StatusChip({ kind, status }: {
//   kind: 'order'; status: OrderStatus
// } | {
//   kind: 'item'; status: ItemStatus
// }) {
//   const meta = kind === 'order' ? ORDER_STATUS[status] : ITEM_STATUS[status]
//   return (
//     <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[11.5px] font-medium ${meta.cls}`}>
//       {meta.label}
//     </span>
//   )
// }


// /* ═══════════ 统计卡片 ═══════════ */

// function StatCard({
//   icon: Icon, label, value, hint, accent, valueColor = C_PRIMARY,
// }: {
//   icon: typeof ClipboardList
//   label: string
//   value: string
//   hint: string
//   accent: string
//   valueColor?: string
// }) {
//   return (
//     <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--panel) px-4 py-4 transition-colors hover:border-(--border-strong)">
//       <span className={`absolute inset-y-0 left-0 w-0.5 ${accent}`} aria-hidden="true" />
//       <div className="flex items-start gap-3">
//         <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-(--border) bg-white/3 text-(--muted)">
//           <Icon size={18} />
//         </div>
//         <div className="min-w-0">
//           <p className={`text-[12.5px] font-medium ${C_MUTED}`}>{label}</p>
//           <p className={`mt-1 text-[24px] font-bold leading-none ${valueColor}`}>{value}</p>
//           <p className={`mt-1.5 text-[12px] ${C_MUTED}`}>{hint}</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// /* ═══════════ 主页面 ═══════════ */

// function PurchasePage() {
//   const navigate = useNavigate()
//   const { t } = useLanguage()

//   const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
//   const [keyword, setKeyword] = useState('')
//   const [page, setPage] = useState(1)
//   const pageSize = 12

//   const filtered = useMemo(() => {
//     return MOCK_ROWS.filter((r) => {
//       if (activeStatus !== 'all' && r.status !== activeStatus) return false
//       if (keyword.trim()) {
//         const kw = keyword.trim().toLowerCase()
//         const hit =
//           r.code.toLowerCase().includes(kw) ||
//           r.supplier.toLowerCase().includes(kw) ||
//           r.buyer.toLowerCase().includes(kw) ||
//           r.partNumber.toLowerCase().includes(kw) ||
//           r.brand.toLowerCase().includes(kw) ||
//           r.silkscreen.toLowerCase().includes(kw)
//         if (!hit) return false
//       }
//       return true
//     })
//   }, [activeStatus, keyword])

//   const statusCounts = useMemo(() => {
//     const counts: Record<string, number> = { all: MOCK_ROWS.length }
//       ; (['pending', 'ordered', 'shipping', 'received'] as OrderStatus[]).forEach((s) => {
//         counts[s] = MOCK_ROWS.filter((r) => r.status === s).length
//       })
//     return counts
//   }, [])

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
//   const safePage = Math.min(page, totalPages)
//   const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
//   const pageNumbers = getPageNumbers(safePage, totalPages)

//   const switchStatus = (s: OrderStatus | 'all') => {
//     setActiveStatus(s)
//     setPage(1)
//   }

//   return (
//     <div className="flex flex-col gap-5 pb-8">

//       {/* ══ 页头 ══ */}
//       <header className="flex flex-wrap items-start justify-between gap-4">
//         <div>
//           <h1 className={`text-3xl font-bold ${C_PRIMARY}`}>采购管理</h1>
//           <p className={`mt-1.5 text-[14px] ${C_MUTED}`}>采购单与供应商</p>
//         </div>
//         <div className="flex items-center gap-2.5">
//           <button
//             type="button"
//             className={`inline-flex items-center gap-2 rounded-[10px] border border-(--border) bg-(--panel) px-4 py-2.5 text-[14px] font-medium ${C_PRIMARY} transition-colors hover:bg-white/5`}
//           >
//             <Download size={16} />
//             导出 Excel
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/purchase/new')}
//             className="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-2.5 text-[14px] font-semibold text-(--bg-soft) transition-opacity hover:opacity-90"
//           >
//             <Plus size={16} />
//             新建采购单
//           </button>
//         </div>
//       </header>

//       {/* ══ 统计卡片 ══ */}
//       <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard icon={ClipboardList} label="在途采购单" value="14" hint="占用资金 ¥124M" accent="bg-amber-400" valueColor="text-amber-400" />
//         <StatCard icon={Clock} label="待审批" value="2" hint="需 24h 内处理" accent="bg-rose-400" valueColor="text-rose-400" />
//         <StatCard icon={PackageCheck} label="本周到货" value="5" hint="预计入库 8.6M 颗" accent="bg-emerald-400" valueColor="text-emerald-400" />
//         <StatCard icon={Handshake} label="合作供应商" value="38" hint="本季度新增 3 家" accent="bg-sky-400" valueColor="text-sky-400" />
//       </div>

//       {/* ══ 采购单区块 ══ */}
//       <section className="flex flex-col rounded-[18px] border border-(--border) bg-(--panel) shadow-[0_10px_24px_var(--shadow)]">

//         {/* ══ Tab 行 ══ */}
//         <div className="flex flex-wrap items-center gap-3 border-b border-(--border) px-4 py-3">
//           <div className="flex flex-wrap items-center gap-1.5">
//             <button
//               type="button"
//               onClick={() => switchStatus('all')}
//               className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${activeStatus === 'all'
//                 ? 'bg-(--accent)/12 text-(--accent)'
//                 : `${C_MUTED} hover:bg-white/5 hover:text-(--text)`
//                 }`}
//             >
//               全部
//               <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${activeStatus === 'all' ? 'bg-(--accent)/20 text-(--accent)' : 'bg-white/8 text-(--text-soft)'
//                 }`}>
//                 {statusCounts.all}
//               </span>
//             </button>

//             {(['pending', 'ordered', 'shipping', 'received'] as OrderStatus[]).map((s) => {
//               const active = activeStatus === s
//               return (
//                 <button
//                   key={s}
//                   type="button"
//                   onClick={() => switchStatus(s)}
//                   className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${active
//                     ? 'bg-(--accent)/12 text-(--accent)'
//                     : `${C_MUTED} hover:bg-white/5 hover:text-(--text)`
//                     }`}
//                 >
//                   {ORDER_STATUS[s].label}
//                   <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${active ? 'bg-(--accent)/20 text-(--accent)' : 'bg-white/8 text-(--text-soft)'
//                     }`}>
//                     {statusCounts[s]}
//                   </span>
//                 </button>
//               )
//             })}
//           </div>

//           <div className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-(--border) bg-(--surface-2) px-3.5 transition-colors focus-within:border-(--accent)">
//             <Search size={16} className={`shrink-0 ${C_MUTED}`} />
//             <input
//               type="text"
//               value={keyword}
//               onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
//               placeholder="搜索型号、丝印、供应商、采购员..."
//               className={`w-72 bg-transparent text-[14px] ${C_PRIMARY} outline-none placeholder:text-(--muted)`}
//             />
//             {keyword && (
//               <button
//                 type="button"
//                 onClick={() => { setKeyword(''); setPage(1) }}
//                 className={`shrink-0 ${C_MUTED} hover:text-(--text)`}
//                 aria-label="clear"
//               >
//                 <X size={15} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ══ 表格(整体升一档) ══ */}
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-[13.5px]">
//             <thead>
//               <tr className="border-b border-(--border) bg-black/10">
//                 {[
//                   { key: 'supplier', label: '供应商', align: 'left' },
//                   { key: 'partNumber', label: '型号 / 描述', align: 'left' },
//                   { key: 'silkscreen', label: '丝印', align: 'left' },
//                   { key: 'batch', label: '批次', align: 'left' },
//                   { key: 'package', label: '封装', align: 'left' },
//                   { key: 'brand', label: '品牌', align: 'left' },
//                   { key: 'qty', label: '数量', align: 'right' },
//                   { key: 'price', label: '单价(未税)', align: 'right' },
//                   { key: 'total', label: '总价', align: 'right' },
//                   { key: 'status', label: '状态', align: 'left' },
//                   { key: 'meta', label: '采购员 / 日期', align: 'left' },
//                   { key: 'actions', label: '操作', align: 'right' },
//                 ].map((col) => (
//                   <th
//                     key={col.key}
//                     className={`whitespace-nowrap px-3 py-3.5 text-[12px] font-medium ${C_MUTED} ${col.align === 'right' ? 'text-right' : 'text-left'
//                       }`}
//                   >
//                     <span className="inline-flex items-center gap-1.5">
//                       {col.label}
//                       {col.key !== 'actions' && (
//                         <ArrowUpDown size={11} className="opacity-40 hover:opacity-100" />
//                       )}
//                     </span>
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {pageData.length === 0 ? (
//                 <tr>
//                   <td colSpan={12} className={`px-4 py-20 text-center ${C_MUTED}`}>
//                     {t('noPurchaseOrders')}
//                   </td>
//                 </tr>
//               ) : (
//                 pageData.map((r) => (
//                   <tr
//                     key={r.id}
//                     className="group border-b border-(--border)/60 transition-colors last:border-b-0 hover:bg-(--accent)/4"
//                   >
//                     {/* 供应商 — 带状态色条 */}
//                     <td className="relative whitespace-nowrap py-3.5 pl-4 pr-3">
//                       <span
//                         className={`absolute inset-y-1 left-0 w-0.5 rounded-r ${ORDER_STATUS[r.status].bar}`}
//                         aria-hidden="true"
//                       />
//                       <div className="inline-flex items-center gap-1.5">
//                         <Building2 size={13} className="shrink-0 text-(--muted) opacity-70" />
//                         <span className={`max-w-56 truncate text-[13.5px] font-medium ${C_PRIMARY}`}>
//                           {r.supplier}
//                         </span>
//                       </div>
//                     </td>

//                     {/* 型号(紫) / 描述 */}
//                     <td className="px-3 py-3.5">
//                       <div className={`font-mono font-semibold ${C_PART}`}>{r.partNumber}</div>
//                       <div className={`mt-1 max-w-64 truncate text-[12px] ${C_MUTED}`}>
//                         {r.description}
//                       </div>
//                     </td>

//                     {/* 丝印 */}
//                     <td className={`whitespace-nowrap px-3 py-3.5 font-mono ${C_SECONDARY}`}>
//                       {r.silkscreen}
//                     </td>

//                     {/* 批次 */}
//                     <td className={`whitespace-nowrap px-3 py-3.5 font-mono ${C_MUTED}`}>
//                       {r.batch}
//                     </td>

//                     {/* 封装 */}
//                     <td className="whitespace-nowrap px-3 py-3.5">
//                       <span className="inline-flex items-center rounded-md border border-(--accent)/25 bg-(--accent)/12 px-2.5 py-1 font-mono text-[12px] font-semibold text-(--accent)">
//                         {r.packageType}
//                       </span>
//                     </td>

//                     {/* 品牌 */}
//                     <td className={`whitespace-nowrap px-3 py-3.5 ${C_SECONDARY}`}>
//                       {r.brand}
//                     </td>

//                     {/* 数量 */}
//                     <td className={`whitespace-nowrap px-3 py-3.5 text-right font-mono font-semibold ${C_PRIMARY}`}>
//                       {formatInt(r.qty)}
//                     </td>

//                     {/* 单价 */}
//                     <td className={`whitespace-nowrap px-3 py-3.5 text-right font-mono ${C_SECONDARY}`}>
//                       {formatMoney(r.unitPrice)}
//                     </td>

//                     {/* 总价 */}
//                     <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono font-bold text-emerald-400">
//                       {formatMoney(r.qty * r.unitPrice)}
//                     </td>

//                     {/* 状态 */}
//                     <td className="whitespace-nowrap px-3 py-3.5">
//                       <div className="flex flex-col items-start gap-1">
//                         <StatusChip kind="order" status={r.status} />
//                         {(r.itemStatus !== 'waiting' || r.status === 'received') && (
//                           <StatusChip kind="item" status={r.itemStatus} />
//                         )}
//                       </div>
//                     </td>

//                     {/* 采购员 / 日期 */}
//                     <td className="whitespace-nowrap px-3 py-3.5">
//                       <div className={`inline-flex items-center gap-1.5 text-[12px] ${C_MUTED}`}>
//                         <User size={12} className="shrink-0 opacity-60" />
//                         {r.buyer}
//                       </div>
//                       <div className={`mt-1 inline-flex items-center gap-1 pl-7 text-[12px] ${C_MUTED}`}>
//                         <Calendar size={12} className="shrink-0 opacity-60" />
//                         {formatDate(r.date)}
//                       </div>
//                     </td>

//                     {/* 操作 */}
//                     <td className="whitespace-nowrap px-3 py-3.5 text-right">
//                       <div className="inline-flex items-center gap-0.5">
//                         <button
//                           type="button"
//                           className={`grid size-8 place-items-center rounded-md ${C_MUTED} transition-colors hover:bg-sky-400/15 hover:text-sky-400`}
//                           title="打印"
//                         >
//                           <Printer size={14} />
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => navigate(`/purchase/edit/${r.id}`)}
//                           className={`grid size-8 place-items-center rounded-md ${C_MUTED} transition-colors hover:bg-(--accent)/15 hover:text-(--accent)`}
//                           title="编辑"
//                         >
//                           <Pencil size={14} />
//                         </button>
//                         <button
//                           type="button"
//                           className={`grid size-8 place-items-center rounded-md ${C_MUTED} transition-colors hover:bg-rose-400/15 hover:text-rose-400`}
//                           title="删除"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ══ 底部 ══ */}
//         {filtered.length > 0 && (
//           <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border) px-4 py-3.5">
//             <p className={`text-[13px] ${C_MUTED}`}>
//               共 <span className={`font-semibold ${C_SECONDARY}`}>{filtered.length}</span> 条物料
//               {totalPages > 1 && (
//                 <>
//                   <span className="mx-2 opacity-40">·</span>
//                   第 {safePage} / {totalPages} 页
//                 </>
//               )}
//             </p>

//             {totalPages > 1 && (
//               <div className="flex items-center gap-1">
//                 <button
//                   type="button"
//                   disabled={safePage === 1}
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   className={`grid size-9 place-items-center rounded-lg border border-(--border) ${C_MUTED} transition-colors hover:bg-white/5 hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-35`}
//                   aria-label="上一页"
//                 >
//                   <ChevronLeft size={15} />
//                 </button>

//                 {pageNumbers.map((n, i) =>
//                   n === 'gap' ? (
//                     <span key={`gap-${i}`} className={`px-2 ${C_MUTED}`}>…</span>
//                   ) : (
//                     <button
//                       key={n}
//                       type="button"
//                       onClick={() => setPage(n)}
//                       className={`grid size-9 place-items-center rounded-lg text-[13.5px] font-medium transition-colors ${n === safePage
//                         ? 'bg-(--accent) text-(--bg-soft)'
//                         : `${C_SECONDARY} hover:bg-white/5`
//                         }`}
//                       aria-current={n === safePage ? 'page' : undefined}
//                     >
//                       {n}
//                     </button>
//                   )
//                 )}

//                 <button
//                   type="button"
//                   disabled={safePage === totalPages}
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   className={`grid size-9 place-items-center rounded-lg border border-(--border) ${C_MUTED} transition-colors hover:bg-white/5 hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-35`}
//                   aria-label="下一页"
//                 >
//                   <ChevronRight size={15} />
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   )
// }

function PurchasePage() {
  return (
    <>Coming soon</>
  )
}

export default PurchasePage

