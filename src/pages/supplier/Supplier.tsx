import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from 'radix-ui'
import { ChevronDown, Pencil, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '../../app/providers/useLanguage'
import { useConfirm } from '../../components/alert-dialog/ConfirmDialog'
import {
  useDeleteSupplierMutation,
  useSuppliersQuery,
  useUpdateSupplierMutation,
} from '../../features/supplier/queries'
import type { Supplier } from '../../features/supplier/api'
import SupplierDraw, { type SupplierDrawFormValues } from './SupplierDraw'
import './Supplier.css'

const pageSize = 10

type SupplierFormValues = SupplierDrawFormValues

const mapFormToSupplier = (values: SupplierFormValues): Omit<Supplier, 'id'> => ({
  name: values.supplierName,
  contact: values.contact,
  phone: values.phone,
  email: values.email,
  address: values.address,
  remark: values.remark,
  status: values.status as Supplier['status'],
})

function SupplierPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const updateSupplierMutation = useUpdateSupplierMutation()
  const deleteSupplierMutation = useDeleteSupplierMutation()
  const statusOptions = [
    { value: 'all', label: t('allStatuses') },
    { value: 'Active', label: 'Active' },
    { value: 'Preferred', label: 'Preferred' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Blocked', label: 'Blocked' },
  ] as const
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]['value']>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const confirm = useConfirm()

  const { data, isLoading, isError, error } = useSuppliersQuery({
    keyword: searchTerm || undefined,
    status: statusFilter === 'all' ? 'all' : statusFilter,
    page: currentPage,
    pageSize,
  })

  const suppliers = data?.items ?? []
  const totalSuppliers = data?.total ?? suppliers.length
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const currentSuppliers = suppliers
  const preferredCount = suppliers.filter((item) => item.status === 'Preferred').length

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1]

    if (safeCurrentPage <= 3) {
      pages.push(2, 3, 4, 'ellipsis-right', totalPages)
      return pages
    }

    if (safeCurrentPage >= totalPages - 2) {
      pages.push('ellipsis-left', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      return pages
    }

    pages.push('ellipsis-left', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, 'ellipsis-right', totalPages)
    return pages
  })()

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingSupplier(null)
  }

  const openCreatePage = () => {
    navigate('/suppliers/new')
  }

  const openEditDrawer = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setDrawerOpen(true)
  }

  const formValues = editingSupplier
    ? {
      supplierName: editingSupplier.name,
      contact: editingSupplier.contact,
      email: editingSupplier.email,
      phone: editingSupplier.phone,
      status: editingSupplier.status,
      address: editingSupplier.address,
      remark: editingSupplier.remark,
    }
    : undefined

  const handleSubmit = (values: SupplierFormValues) => {
    if (!editingSupplier) {
      return
    }

    const supplier = mapFormToSupplier(values)

    updateSupplierMutation.mutate(
      { id: editingSupplier.id, supplier },
      {
        onSuccess: () => {
          toast.success(t('supplierUpdateSuccess'), {
            description: t('supplierUpdateSuccessDesc'),
          })
          closeDrawer()
        },
        onError: (error) => {
          toast.error(t('supplierUpdateFailed'), {
            description: error instanceof Error ? error.message : 'Please check your network connection and try again.',
          })
        },
      },
    )
  }

  const handleDelete = async (supplier: Supplier) => {
    const confirmed = await confirm({
      title: t('confirmDeleteSupplier'),
      description: t('deleteSupplierMessage').replace('{name}', supplier.name),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    deleteSupplierMutation.mutate(supplier.id, {
      onSuccess: () => {
        toast.success(t('supplierDeleteSuccess'), {
          description: t('supplierDeleteSuccessDesc').replace('{name}', supplier.name),
        })
        setCurrentPage((page) => Math.max(1, page))
      },
      onError: (error) => {
        toast.error(t('supplierDeleteFailed'), {
          description: error instanceof Error ? error.message : 'Please check your network connection and try again.',
        })
      },
    })
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <p className="text-(--txt-color-muted) text-xs">{t('vendors')}</p>
            <h1 className="text-(--txt-color-primary) text-3xl">{t('suppliers')}</h1>
          </div>
          <button type="button" className="supplier-button" onClick={openCreatePage}>{t('newSupplier')}</button>

        </div>

        <div className="bg-(--bg-panel) rounded-2xl border border-(--border-color) overflow-hidden shadow-(--shadow)">
          <div className="flex justify-end items-center px-3 py-3 gap-4 border-b border-(--border-color)">
            {/* <div className="supplier-toolbar-actions"> */}
            <div className="flex items-center gap-2">
              {/* <span className="supplier-filter-label">{t('status')}</span> */}
              <span className="text-sm text-(--txt-color-muted)">{t('status')}</span>
              <Select.Root
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as (typeof statusOptions)[number]['value'])
                  setCurrentPage(1)
                }}
              >
                <Select.Trigger className="h-10 w-30 px-2 inline-flex items-center justify-between text-(--txt-color-primary) border border-(--border-color) rounded-lg" aria-label={t('filterSuppliersByStatus')}>
                  <Select.Value placeholder={t('allStatuses')} />
                  <Select.Icon className="">
                    <ChevronDown size={16} className='text-(--muted)' />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="border border-(--border-color) rounded-lg shadow-(--shadow) bg-(--bg-panel-strong) overflow-hidden" position="popper" sideOffset={8}>
                    <Select.Viewport className="px-2 py-2">
                      {statusOptions.map((option) => (
                        <Select.Item key={option.value} value={option.value}
                          className="flex items-center px-2.5 py-2 text-(--txt-color-primary) mb-1 last:mb-0 rounded-lg cursor-pointer  data-[state=checked]:bg-(--select) data-[state=checked]:font-medium hover:bg-(--select)/50">
                          <Select.ItemText>{option.label}</Select.ItemText>
                          {/* <Select.ItemIndicator>
                            <Check size={16} />
                          </Select.ItemIndicator> */}
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="flex items-center gap-2 bg-(--bg-panel) h-10 rounded-lg px-4 border border-(--border-color) focus-within:ring-1">
              <Search className="text-(--muted)" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder={t('searchSuppliers')}
                className='placeholder-(--muted) focus:outline-none w-60'
              />
            </div>
            {/* </div> */}
          </div>

          <div className="overflow-auto">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th className="supplier-name-col">{t('supplierName')}</th>
                  <th>{t('contact')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('email')}</th>
                  <th>{t('address')}</th>
                  <th>{t('remark')}</th>
                  <th className="supplier-action-col">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="supplier-empty-state">
                      {t('loading')}
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="supplier-empty-state">
                      {error instanceof Error ? error.message : t('dataLoadFailed')}
                    </td>
                  </tr>
                ) : currentSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="supplier-empty-state">
                      {t('noData')}
                    </td>
                  </tr>
                ) : (
                  currentSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="supplier-name-col">
                        <div className="supplier-name-cell">
                          <span className="supplier-name">{supplier.name}</span>
                          <small className="supplier-status">{supplier.status}</small>
                        </div>
                      </td>
                      <td>{supplier.contact}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.address}</td>
                      <td>{supplier.remark}</td>
                      <td className="supplier-action-col">
                        <div className="supplier-action-group">
                          <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-(--operation)/10 text-nowrap text-(--color-operation) hover:bg-(--operation)/25"
                            onClick={() => openEditDrawer(supplier)}><Pencil size={10} />{t('edit')}</button>
                          <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-(--destructive)/10 text-nowrap text-(--color-destructive) hover:bg-(--destructive)/25"
                            onClick={() => handleDelete(supplier)} disabled={deleteSupplierMutation.isPending}>
                            <Trash2 size={10} />
                            <span>{t('delete')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="supplier-footer-bar">
            <div className="supplier-footer-summary">
              <span>{t('totalSuppliers').replace('{count}', String(totalSuppliers)).replace('{preferred}', String(preferredCount))}</span>
            </div>

            <div className="supplier-pagination">
              <button type="button" className="supplier-page-button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                {t('previousPage')}
              </button>

              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === 'ellipsis-left' || pageNumber === 'ellipsis-right') {
                  return (
                    <span key={`${pageNumber}-${index}`} className="supplier-page-ellipsis">
                      ...
                    </span>
                  )
                }

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`supplier-page-number ${safeCurrentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages))}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button type="button" className="supplier-page-button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                {t('nextPage')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SupplierDraw
        open={drawerOpen}
        title={t('editSupplier')}
        subtitle={t('vendors')}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        initialValues={formValues}
      />
    </>
  )
}

export default SupplierPage