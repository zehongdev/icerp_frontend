import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Select } from 'radix-ui'
import { toast } from 'sonner'
import { useLanguage } from '../../app/providers/useLanguage'
import { useCreateSupplierMutation } from '../../features/supplier/queries'
import type { Supplier } from '../../features/supplier/api'
import type { SupplierDrawFormValues } from './SupplierDraw'

type SupplierFormValues = SupplierDrawFormValues

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Preferred', label: 'Preferred' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Blocked', label: 'Blocked' },
]

const createInitialForm = (): SupplierFormValues => ({
  supplierName: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  remark: '',
  status: 'Active',
})

const mapFormToSupplier = (values: SupplierFormValues): Omit<Supplier, 'id'> => ({
  name: values.supplierName,
  contact: values.contact,
  phone: values.phone,
  email: values.email,
  address: values.address,
  remark: values.remark,
  status: values.status as Supplier['status'],
})

const fieldClassName = 'flex flex-col gap-2 text-[0.82rem] text-(--text-soft)'
const fullWidthFieldClassName = `${fieldClassName} lg:col-span-2`
const inputClassName =
  'w-full resize-y rounded-[10px] border border-(--border) bg-(--surface-2) px-3 py-2.75 text-(--text) outline-none focus:border-(--accent)'

function SupplierNewPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const createSupplierMutation = useCreateSupplierMutation()
  const [form, setForm] = useState<SupplierFormValues>(() => createInitialForm())

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createSupplierMutation.mutate(mapFormToSupplier(form), {
      onSuccess: () => {
        toast.success(t('supplierCreateSuccess'), {
          description: t('supplierCreateSuccessDesc'),
        })
        navigate('/suppliers')
      },
      onError: (error) => {
        toast.error(t('supplierCreateFailed'), {
          description: error instanceof Error ? error.message : 'Please check your network connection and try again.',
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1 text-[0.78rem] font-semibold leading-[1.2] tracking-[0.01em] text-(--muted) transition-colors hover:bg-slate-400/5 hover:text-(--text) focus:outline-none focus:bg-slate-400/5"
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="size-4 rounded-md border border-slate-400/20 bg-slate-400/5 p-0.75 text-(--text-soft)" aria-hidden="true" />
            <span>{t('backSupplierList')}</span>
          </button>
          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.08em] text-(--muted)">{t('vendors')}</p>
            <h1 className="text-[clamp(1.7rem,2vw,2.2rem)] text-(--text)">{t('newSupplierTitle')}</h1>
          </div>
        </div>
      </header>

      <form className="rounded-[18px] border border-(--border) bg-(--panel) p-5.5 shadow-[0_10px_24px_var(--shadow)]" onSubmit={handleSubmit}>
        <div className="grid gap-4.5 lg:grid-cols-2">
          <label className={fieldClassName}>
            <span>{t('supplierName')}</span>
            <input className={inputClassName} name="supplierName" value={form.supplierName} onChange={handleChange} required />
          </label>

          <label className={fieldClassName}>
            <span>{t('contact')}</span>
            <input className={inputClassName} name="contact" value={form.contact} onChange={handleChange} />
          </label>

          <label className={fieldClassName}>
            <span>{t('phone')}</span>
            <input className={inputClassName} name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label className={fieldClassName}>
            <span>{t('email')}</span>
            <input className={inputClassName} type="email" name="email" value={form.email} onChange={handleChange} />
          </label>

          <label className={fieldClassName}>
            <span>{t('status')}</span>
            <Select.Root
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
            >
              <Select.Trigger className={`${inputClassName} inline-flex min-h-11 items-center justify-between gap-2`} aria-label={t('status')}>
                <Select.Value placeholder={t('selectStatus')} />
                <Select.Icon className="text-(--muted)">
                  <ChevronDown size={14} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="z-1000 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--border) bg-(--panel-strong) text-(--text)"
                  position="popper"
                  sideOffset={8}
                >
                  <Select.Viewport className="p-1.5">
                    {statusOptions.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className="mb-1 flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-(--text-soft) outline-none transition-colors last:mb-0 data-highlighted:bg-(--select) data-highlighted:text-(--text) data-[state=checked]:bg-(--select) data-[state=checked]:font-medium"
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </label>

          <label className={fullWidthFieldClassName}>
            <span>{t('address')}</span>
            <input className={inputClassName} name="address" value={form.address} onChange={handleChange} />
          </label>

          <label className={fullWidthFieldClassName}>
            <span>{t('remark')}</span>
            <textarea
              className={`${inputClassName} min-h-24`}
              rows={3}
              name="remark"
              value={form.remark}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="mt-5.5 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-[10px] bg-(--panel-strong) px-4 py-2.5 font-semibold text-(--text)"
            onClick={() => navigate('/suppliers')}
          >
            {t('cancel')}
          </button>
          <button type="submit" className="rounded-[10px] bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-2.5 font-semibold text-(--bg-soft)">
            {t('saveSupplier')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SupplierNewPage
