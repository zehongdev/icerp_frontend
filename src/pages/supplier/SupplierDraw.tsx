import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Select } from 'radix-ui'
import { useLanguage } from '../../app/providers/useLanguage'

export type SupplierDrawFormValues = {
  supplierName: string
  contact: string
  email: string
  phone: string
  address: string
  remark: string
  status: string
}

type SupplierDrawProps = {
  open?: boolean
  title?: string
  subtitle?: string
  onClose?: () => void
  children?: ReactNode
  initialValues?: SupplierDrawFormValues
  onSubmit?: (values: SupplierDrawFormValues) => void
}

const STATUS_OPTIONS = ['Active', 'Preferred', 'Pending', 'Blocked'] as const

const FORM_ID = 'supplier-draw-form'
const TITLE_ID = 'supplier-draw-title'
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const createInitialValues = (): SupplierDrawFormValues => ({
  supplierName: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  remark: '',
  status: '',
})

const inputClassName =
  'h-10 w-full rounded-lg border border-white/10 bg-(--surface-2) px-3 text-sm text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-(--accent)'

const labelClassName = 'flex flex-col gap-2 text-xs text-(--text-soft)'
const fullWidthLabelClassName = `${labelClassName} sm:col-span-2`
const selectTriggerClassName =
  'flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-(--surface-2) px-3 text-sm text-(--text) outline-none transition-colors data-placeholder:text-(--muted) focus:border-(--accent)'
const secondaryButtonClassName =
  'rounded-lg border border-white/10 bg-(--panel-strong) px-4 py-2.5 text-sm font-semibold text-(--text) transition-colors hover:bg-white/10'
const primaryButtonClassName =
  'rounded-lg bg-linear-to-r from-(--green) to-(--accent) px-4 py-2.5 text-sm font-semibold text-(--bg-soft) transition-opacity hover:opacity-90'

/** 字段分组:小标题 + 两列栅格 */
function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-(--muted)">{label}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function SupplierDraw({
  open = false,
  title = 'Edit Supplier',
  subtitle = 'Vendors',
  onClose = () => undefined,
  children,
  initialValues,
  onSubmit,
}: SupplierDrawProps) {
  const { t } = useLanguage()
  const panelRef = useRef<HTMLElement>(null)
  const [form, setForm] = useState<SupplierDrawFormValues>(() => initialValues ?? createInitialValues())

  useEffect(() => {
    if (open) {
      setForm(initialValues ?? createInitialValues())
    }
  }, [open, initialValues])

  /* ── 滚动锁定(含 scrollbar 补偿) ── */
  useEffect(() => {
    if (!open) return undefined

    const { body } = document
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [open])

  /* ── ESC + Tab 焦点循环 + 焦点归还 ── */
  useEffect(() => {
    if (!open) return undefined
    const panel = panelRef.current
    if (!panel) return undefined

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      )

    // 初始聚焦:优先第一个可输入元素,避免落到关闭按钮上
    // const initial = panel.querySelector<HTMLElement>('input, textarea, select, button')
    //   ; (initial ?? panel).focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.(form)
  }

  const defaultContent = (
    <form id={FORM_ID} className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup label={t('basicInfo')}>
        <label className={fullWidthLabelClassName}>
          <span>{t('supplierName')}</span>
          <input className={inputClassName} name="supplierName" value={form.supplierName} onChange={handleChange} required />
        </label>

        <label className={labelClassName}>
          <span>{t('status')}</span>
          <Select.Root
            name="status"
            value={form.status}
            onValueChange={(status) => setForm((prev) => ({ ...prev, status }))}
          >
            <Select.Trigger
              aria-label={t('status')}
              className={selectTriggerClassName}
            >
              <Select.Value placeholder={t('selectStatus')} />
              <Select.Icon className="text-(--muted)">
                <ChevronDown size={14} aria-hidden="true" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                sideOffset={8}
                className="z-1000 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-white/10 bg-(--panel) p-1 shadow-xl outline-none"
              >
                <Select.Viewport className="flex flex-col gap-0.5">
                  {STATUS_OPTIONS.map((status) => (
                    <Select.Item
                      key={status}
                      value={status}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-(--text) outline-none transition-colors data-highlighted:bg-(--select)/50 data-[state=checked]:bg-(--select) data-[state=checked]:font-medium"
                    >
                      <Select.ItemText>{status}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </label>
      </FieldGroup>

      <FieldGroup label={t('contactInfo')}>
        <label className={labelClassName}>
          <span>{t('contact')}</span>
          <input className={inputClassName} name="contact" value={form.contact} onChange={handleChange} />
        </label>

        <label className={labelClassName}>
          <span>{t('phone')}</span>
          <input className={inputClassName} name="phone" value={form.phone} onChange={handleChange} />
        </label>

        <label className={fullWidthLabelClassName}>
          <span>{t('email')}</span>
          <input className={inputClassName} type="email" name="email" value={form.email} onChange={handleChange} />
        </label>
      </FieldGroup>

      <FieldGroup label={t('otherInfo')}>
        <label className={fullWidthLabelClassName}>
          <span>{t('address')}</span>
          <input className={inputClassName} name="address" value={form.address} onChange={handleChange} />
        </label>

        <label className={fullWidthLabelClassName}>
          <span>{t('remark')}</span>
          <textarea
            className={`${inputClassName} h-40 resize-none py-2.5`}
            name="remark"
            value={form.remark}
            onChange={handleChange}
            rows={4}
          />
        </label>
      </FieldGroup>
    </form>
  )

  return (
    <div
      className="fixed inset-0 z-1000 flex justify-end overscroll-none bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="flex h-full w-full max-w-120 flex-col border-l border-white/10 bg-(--panel) text-(--text) shadow-[-18px_0_36px_rgba(15,23,42,0.28)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-(--border) px-6 py-5">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-xs uppercase tracking-[0.08em] text-(--muted)">
              {subtitle ?? t('vendors')}
            </p>
            <h2 id={TITLE_ID} className="truncate text-xl font-bold leading-tight text-(--text)">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-white/5 hover:text-(--text)"
            aria-label={t('cancel')}
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {children ?? defaultContent}
        </div>

        {!children && (
          <footer className="flex shrink-0 justify-end gap-3 border-t border-(--border) px-6 py-4">
            <button
              type="button"
              className={secondaryButtonClassName}
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              form={FORM_ID}
              className={primaryButtonClassName}
            >
              {t('saveSupplier')}
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}

export default SupplierDraw