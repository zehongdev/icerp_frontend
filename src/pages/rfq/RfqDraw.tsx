import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Select } from 'radix-ui'
// import Select from '../../components/select/Select'
import { supplierApi, type SupplierInputOption } from '../../features/supplier/api'
import {
  createDefaultDetailDraft,
  rfqDetailStatusOptions,
  type RfqDetailDraft,
} from './types'

import SupplierInput from '../../components/supplier-input/SupplierInput'
import { useConfirm } from '../../components/alert-dialog/ConfirmDialog'

export type RfqDrawerProps = {
  open?: boolean
  title?: string
  onClose?: () => void
  onSave?: (nextValues: RfqDetailDraft) => void
  initialValues?: RfqDetailDraft
  itemName?: string
}

function RfqDrawer({
  open = false,
  title = 'Edit RFQ',
  onClose = () => undefined,
  onSave,
  initialValues,
  itemName,
}: RfqDrawerProps) {
  const [form, setForm] = useState<RfqDetailDraft>(() => initialValues ?? createDefaultDetailDraft())
  const [supplierOptions, setSupplierOptions] = useState<SupplierInputOption[]>([])
  const [isSupplierSearchLoading, setIsSupplierSearchLoading] = useState(false)
  const [supplierSearchError, setSupplierSearchError] = useState<string | null>(null)
  const [searchedSupplierName, setSearchedSupplierName] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const confirmed = useConfirm();

  useEffect(() => {
    setForm(initialValues ?? createDefaultDetailDraft())
  }, [initialValues])

  useEffect(() => {
    if (!isVisible) {
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setIsSupplierSearchLoading(true)
      setSupplierSearchError(null)

      const searchName = form.supplier_name.trim()
      supplierApi.searchForInput(searchName, controller.signal)
        .then((options) => {
          if (!controller.signal.aborted) {
            setSupplierOptions(options)
            setSearchedSupplierName(searchName)

            const matchedSupplier = options.find((supplier) => supplier.name === searchName)
            if (matchedSupplier) {
              setForm((current) => (
                current.supplier_name.trim() === searchName
                  ? { ...current, supplier_id: matchedSupplier.id, supplier_name: matchedSupplier.name }
                  : current
              ))
            }
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            console.error('Failed to search suppliers:', error)
            setSupplierSearchError('供应商列表加载失败，请稍后重试。')
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSupplierSearchLoading(false)
          }
        })
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [form.supplier_name, isVisible])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'price') {
      const trimmed = value.trim();
      // 判断是否非零（不为空且解析后不为 0）
      const isNonZero = trimmed !== '' && !isNaN(parseFloat(trimmed)) && parseFloat(trimmed) !== 0;
      setForm((prev) => ({
        ...prev,
        [name]: value,
        // 如果非零则同步更新 status 为“已报价”（需与 options 中的 value 一致）
        ...(isNonZero && { status: '已报价' }),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const supplierName = form.supplier_name.trim()

    if (!supplierName) {
      setSupplierSearchError('请选择供应商。')
      return
    }

    let matchingSupplier: SupplierInputOption | undefined
    try {
      const options = await supplierApi.searchForInput(supplierName)
      setSupplierOptions(options)
      setSearchedSupplierName(supplierName)
      matchingSupplier = options.find((supplier) => supplier.name === supplierName)
    } catch (error) {
      console.error('Failed to validate supplier:', error)
      setSupplierSearchError('供应商校验失败，请稍后重试。')
      toast.error('供应商校验失败', {
        description: '暂时无法确认供应商是否存在，请检查网络后重试。',
      })
      return
    }

    if (!matchingSupplier) {
      setSupplierSearchError('供应商不存在。')
      confirmed({
        title: '供应商不存在',
        description: '是否新建供应商？',
        confirmText: '新建供应商',
        cancelText: '取消',
        tone: 'danger',
      }).then((result) => {
        if (result) {
          // Handle creating a new supplier here
          supplierApi.create({
            name: supplierName.trim(),
            status: 'Active',
            address: '',
            contact: '',
            remark: '',
            phone: '',
            email: '',
          }).then((newSupplier) => {
            toast.success("供应商已成功创建, 请继续操作。")
            const nextValues = {
              ...form,
              supplier_id: newSupplier.id,
              supplier_name: newSupplier.name,
            };
            setForm(nextValues);
            onSave?.(nextValues);
            onClose();
          })
        } else {
          toast.error("供应商未创建")
        }
      })
      return
    }

    const nextValues = {
      ...form,
      supplier_id: matchingSupplier.id,
      supplier_name: matchingSupplier.name,
    }
    setForm(nextValues)
    onSave?.(nextValues)
    onClose()
  }

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsClosing(false)
      return undefined
    }

    if (!isVisible) {
      return undefined
    }

    setIsClosing(true)
    const timer = window.setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [open, isVisible])

  useEffect(() => {
    if (!isVisible) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, onClose])

  if (!isVisible) {
    return null
  }

  const panelClasses = `rfq-draw-panel${isClosing ? ' rfq-draw-panel--closing' : ''}`
  const backdropClasses = `rfq-draw-backdrop${isClosing ? ' rfq-draw-backdrop--closing' : ''}`
  const normalizedSupplierName = form.supplier_name.trim()
  const isSupplierMissing = (
    normalizedSupplierName.length > 0
    && searchedSupplierName === normalizedSupplierName
    && !supplierOptions.some((supplier) => supplier.name === normalizedSupplierName)
  )
  const supplierValidationMessage = supplierSearchError
    ?? (isSupplierMissing ? '供应商不存在，请从候选列表选择或新建供应商。' : null)

  return (
    <div className={backdropClasses} onClick={onClose}>
      <aside
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rfq-draw-header">
          <div className="rfq-draw-header-text">
            <p className="rfq-draw-kicker">{title}</p>
            <h2 className="rfq-draw-title">{itemName}</h2>
          </div>

          <button type="button" className="rfq-draw-close" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field-full">
              <span>供应商</span>
              <SupplierInput
                value={form.supplier_name}
                options={supplierOptions}
                onValueChange={(supplierName) => {
                  setSupplierSearchError(null)
                  setForm((prev) => ({
                    ...prev,
                    supplier_id: '',
                    supplier_name: supplierName,
                  }))
                }}
                onSelect={(supplier) => {
                  setSupplierSearchError(null)
                  setForm((prev) => ({
                    ...prev,
                    supplier_id: supplier.id,
                    supplier_name: supplier.name,
                  }))
                }}
              />
              {isSupplierSearchLoading && <span className="field-hint">正在加载供应商...</span>}
              {supplierValidationMessage && <span className="field-error" role="alert">{supplierValidationMessage}</span>}
            </label>
            <label className="field">
              <span>批次</span>
              <input name="batch" value={form.batch} onChange={handleChange} />
            </label>
            <label className="field">
              <span>数量</span>
              <input name="quantity" value={form.quantity} onChange={handleChange} pattern="^\d+$" />
            </label>
            <label className="field">
              <span>负责人</span>
              <input name="owner" value={form.owner} onChange={handleChange} />
            </label>
            <label className="field">
              <span>价格</span>
              <input name="price" value={form.price} onChange={handleChange} pattern="^[0-9]+(\.[0-9]{1,4})?$" />
            </label>
            <label className="field">
              <span>状态</span>
              {/* <Select
                value={form.status}
                placeholder="待报价"
                triggerClassName="field-select-trigger"
                contentClassName="field-select-content"
                itemClassName="field-select-item"
                options={rfqDetailStatusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as RfqDetailDraft['status'] }))}
              /> */}
              <Select.Root
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as RfqDetailDraft['status'] }))}
              >
                <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-(--surface-2) px-3 text-sm text-(--text) outline-none transition-colors data-placeholder:text-(--muted) focus:border-(--accent)" aria-label="状态">
                  <Select.Value placeholder="待报价" />
                  <Select.Icon className="text-(--muted)">
                    <ChevronDown size={14} aria-hidden="true" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    position="popper"
                    sideOffset={8}
                    className="z-1000 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--border) bg-(--panel-strong) p-1 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
                  >
                    <Select.Viewport>
                      {rfqDetailStatusOptions.map((option) => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          className="mb-1 cursor-pointer rounded-lg px-3 py-2 text-sm text-(--text-soft) outline-none transition-colors last:mb-0 data-highlighted:bg-(--select) data-highlighted:text-(--text) data-[state=checked]:bg-(--select) data-[state=checked]:font-medium"
                        >
                          <Select.ItemText>{option.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </label>
            <label className="field field-full">
              <span>备注</span>
              <input name="remark" value={form.remark} onChange={handleChange} />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button-dark">Save</button>
          </div>
        </form>
      </aside>
    </div>
  )
}

export default RfqDrawer
