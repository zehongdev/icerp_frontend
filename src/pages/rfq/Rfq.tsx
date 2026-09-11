import { Fragment, useState, useMemo, useEffect } from 'react'
import { CalendarRange, ChevronDown, ChevronRight, Pencil, Plus, Search, Trash2, User, MinusCircle, CheckCheck, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../../components/alert-dialog/ConfirmDialog'
import RfqDrawer from './RfqDraw'
import { toRfqDetailDraft, type RfqDetailDraft, type RfqMain, type RfqDetail } from './types'
import { useRfqMainListQuery, useDeleteRfqMainMutation, useRfqDetailsBatchQuery, useUpdateRfqDetailMutation, useDeleteRfqDetailMutation } from '../../features/rfq/queries'
import './Rfq.css'
import { toast } from 'sonner'

const pageSize = 10
const emptyRfqList: RfqMain[] = []


const filterDayOptions = [
  { label: '今日', value: 'today' },
  { label: '近三天', value: '3d' },
  { label: '近七天', value: '7d' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' }
] as const
type FilterDayValue = typeof filterDayOptions[number]['value']
// 日期格式化为 YYYY-MM-DD
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取日期范围
const getDateRange = (filter: FilterDayValue) => {
  const today = new Date()

  const endDate = formatLocalDate(today)

  switch (filter) {

    // 今日
    case 'today':
      return {
        startDate: endDate,
        endDate
      }


    // 最近三天
    case '3d': {
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 2)

      return {
        startDate: formatLocalDate(startDate),
        endDate
      }
    }


    // 最近七天
    case '7d': {
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)

      return {
        startDate: formatLocalDate(startDate),
        endDate
      }
    }


    // 本月
    case 'month': {
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )

      return {
        startDate: formatLocalDate(startDate),
        endDate
      }
    }


    // 全部
    case 'all':
      return {
        startDate: '1970-01-01',
        endDate
      }
  }
}

const getStatusClassName = (status: string) =>
  statusConfig[status as keyof typeof statusConfig]?.className ?? 'unknown'
// (status === '待报价' ? 'waiting' : 'quoted')
const getStatusIcon = (status: string) =>
  statusConfig[status as keyof typeof statusConfig]?.icon ?? null
// (status === '待报价' ? <CalendarRange size={11} /> : <ChevronDown size={11} />)

const statusConfig = {
  '待报价': { className: 'waiting', icon: <CalendarRange size={11} /> },
  '已报价': { className: 'quoted', icon: <CheckCheck size={11} /> },
  '未报价': { className: 'not-quoted', icon: <MinusCircle size={11} /> }
} as const

function RfqDetailPanel({
  details,
  onEdit,
  onDeleteDetail,
}: {
  details: RfqDetail[]
  onEdit: (detailItem: RfqDetail) => void
  onDeleteDetail: (detailId: number) => void
}) {
  return (
    <div className="rfq-detail-panel">
      {details.length === 0 ? (
        <div className="rfq-detail-empty">
          暂无匹配数据
        </div>
      ) : (
        <>
          {/* 表头 */}
          <div className="rfq-detail-header-row">
            <div className="rfq-detail-header-cell">供应商</div>
            <div className="rfq-detail-header-cell">批次</div>
            <div className="rfq-detail-header-cell">数量</div>
            <div className="rfq-detail-header-cell">报价</div>
            <div className="rfq-detail-header-cell">负责人</div>
            <div className="rfq-detail-header-cell">状态</div>
            <div className="rfq-detail-header-cell">备注</div>
            <div className="rfq-detail-header-cell">操作</div>
          </div>
          {details.map((detailItem) => (
            <div key={detailItem.id} className="rfq-detail-item">
              <div className="rfq-detail-cell-value supplier">{detailItem.supplier_name}</div>
              <div className="rfq-detail-cell-value">{detailItem.batch}</div>
              <div className="rfq-detail-cell-value">{String(detailItem.quantity)}</div>
              <div className="rfq-detail-cell-value price">¥ {detailItem.price}</div>
              <div className="rfq-detail-cell-value owner">
                <span className="rfq-owner-inline">
                  <User size={12} />
                  <span>{detailItem.owner}</span>
                </span>
              </div>
              <div className="rfq-detail-cell-value">
                <span className={`rfq-status ${getStatusClassName(detailItem.status)}`}>
                  <span className="rfq-status-icon">{getStatusIcon(detailItem.status)}</span>
                  <span>{detailItem.status}
                  </span>
                </span>
              </div>
              <div className="rfq-detail-cell-value note">{detailItem.remark}</div>
              <div className="rfq-detail-cell-value action">
                <div className="rfq-action-group detail-action-group">
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-(--operation)/10 text-(--color-operation) hover:bg-(--operation)/25"
                    onClick={() => { onEdit(detailItem) }}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-(--destructive)/10  text-(--color-destructive) hover:bg-(--destructive)/25" onClick={() => onDeleteDetail(detailItem.id)}>
                    <Trash2 size={16} />
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-(--share)/10 text-(--color-share) hover:bg-(--share)/25" onClick={() => { toast.info("功能暂未实现") }}>
                    <Tag size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>)
      }
    </div>
  )
}

function RfqPagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="rfq-pagination">
      <button type="button" className="rfq-page-button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
        Prev
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          className={`rfq-page-number ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button type="button" className="rfq-page-button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  )
}

function RfqPage() {
  const navigate = useNavigate()
  // const [detailsByInquiryId, setDetailsByInquiryId] = useState<Record<number, RfqDetail[]>>({})
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailDrawerItemName, setDetailDrawerItemName] = useState('PART_NUMBER')
  const [editingDetailValues, setEditingDetailValues] = useState<RfqDetailDraft | null>(null)
  const [editingDetailRfqId, setEditingDetailRfqId] = useState<number | null>(null)
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState<(typeof filterDayOptions)[number]['value']>('today')
  const [searchTerm, setSearchTerm] = useState('')
  const confirm = useConfirm()
  const dateRange = getDateRange(selectedFilter)

  const { data, isLoading, isError, error } = useRfqMainListQuery({
    page: currentPage,
    pageSize: pageSize,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    keyword: searchTerm || undefined,
  });
  const deleteRfqMainMutation = useDeleteRfqMainMutation();
  const updateRfqDetailMutation = useUpdateRfqDetailMutation();
  const deleteRfqDetailMutation = useDeleteRfqDetailMutation();

  const rfqs = data?.items ?? emptyRfqList;
  const totalRfqCount = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const currentRows = rfqs

  const allRfqIds = useMemo(
    () => rfqs.map(item => item.id),
    [rfqs]
  )
  const detailQueries = useRfqDetailsBatchQuery(allRfqIds)


  // Expand/collapse state for each RFQ row 默认是展开
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  useEffect(() => {
    setExpandedRows((current) => {
      const hasSameRows =
        current.length === allRfqIds.length &&
        current.every((id, index) => id === allRfqIds[index])

      return hasSameRows ? current : allRfqIds
    })
  }, [allRfqIds])
  const toggleRow = (id: number) => {
    setExpandedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }
  const handleExport = () => {
    toast.info(" 功能暂未实现... ")
  }

  const deleteRfqMain = async (rfqMain: RfqMain) => {
    await confirm({
      title: '确认删除 RFQ',
      description: '删除后，该 RFQ 及其相关询价记录将无法恢复。',
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      deleteRfqMainMutation.mutate(rfqMain.id, {
        onSuccess: () => {
          toast.success("Rfq deleted successfully", {
            description: rfqMain.part_number + " has been deleted"
          })
        },
        onError: () => {
          toast.error("Rfq delete faild")
        }
      })
    })
  }

  const openCreatePage = () => {
    navigate('/rfq/new', { state: { mode: 'create' } })
  }

  const openDetailRowEditor = (detailItem: RfqDetail) => {
    const parentRfq = currentRows.find(item => item.id === detailItem.inquiry_id)

    setEditingDetailValues(toRfqDetailDraft(detailItem))
    setEditingDetailId(detailItem.id)

    setEditingDetailRfqId(detailItem.inquiry_id)

    setDetailDrawerOpen(true)
    setDetailDrawerItemName(parentRfq?.part_number ?? '')
  }

  const saveDetailRow = (nextValues: RfqDetailDraft) => {
    if (editingDetailRfqId === null) {
      return
    }
    updateRfqDetailMutation.mutate({
      id: editingDetailId as number,
      payload: nextValues
    }, {
      onSuccess: () => {
        toast.success("Rfq detail updated successfully")
        closeDetailDrawer()
      },
      onError: () => {
        toast.error(error instanceof Error ? error.message : "Failed to update rfq detail")
      }
    })
  }

  const deleteDetailRow = async (detailId: number) => {
    //TODO
    await confirm({
      title: '确认删除询价详情',
      description: '删除后，该询价详情将无法恢复。',
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
    }).then((confirmed) => {
      if (!confirmed) {
        return
      }
      deleteRfqDetailMutation.mutate(detailId, {
        onSuccess: () => {
          toast.success("Rfq detail deleted successfully")
        },
        onError: () => {
          toast.error("Failed to delete rfq detail")
        }
      })
    })
  }

  const openRfqMainRowEditPage = (item: RfqMain) => {
    navigate(`/rfq/new?rfqmainId=${item.id}`);
  }

  const closeDetailDrawer = () => {
    setDetailDrawerOpen(false)
    setDetailDrawerItemName('型号')
    setEditingDetailValues(null)
    setEditingDetailRfqId(null)
    setEditingDetailId(null)
  }
  const toggleAll = () => {
    if (expandedRows.length > 0) {
      setExpandedRows([])
    } else {
      setExpandedRows(rfqs.map(item => item.id))
    }
  }

  return (
    <>
      <div className="rfq-page">

        <div className="rfq-header">
          <div>
            <p className="rfq-label">Procurement</p>
            <h1>RFQ</h1>
          </div>
          <div className="rfq-actions">
            <button type="button" className="rfq-secondary" onClick={handleExport}>Export</button>
            <button type="button" className="rfq-button" onClick={openCreatePage}>
              <Plus size={14} />
              <span>New RFQ</span>
            </button>
          </div>
        </div>

        <div className="rfq-panel">
          <div className="rfq-toolbar">
            <div className="rfq-toolbar-toggle" onClick={toggleAll}>全部折叠/展开</div>
            <div className="rfq-toolbar-actions">
              <div className="rfq-filter-wrap">
                <span className="rfq-filter-label"></span>
                <div className="rfq-filter-group">
                  <CalendarRange className="rfq-calendar-icon" size={16} />
                  {filterDayOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rfq-filter ${selectedFilter === option.value ? 'active' : ''}`}
                      aria-pressed={selectedFilter === option.value}
                      onClick={() => {
                        setSelectedFilter(option.value)
                        setCurrentPage(1)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rfq-search-wrap">
                <Search className="rfq-search-icon" size={16} />
                <input
                  placeholder="搜索型号/品牌/封装"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }} />
              </div>
            </div>
          </div>

          <div className="rfq-table-wrap">
            <table className="rfq-table">
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="rfq-empty-state">正在加载 RFQ...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="rfq-empty-state">
                      加载 RFQ 失败：{error instanceof Error ? error.message : '请稍后重试。'}
                    </td>
                  </tr>
                ) : rfqs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="rfq-empty-state">暂无数据</td>
                  </tr>
                ) : (
                  currentRows.map((item) => {

                    const isExpanded = expandedRows.includes(item.id)

                    const detailIndex = allRfqIds.indexOf(item.id)

                    const details =
                      detailIndex >= 0
                        ? detailQueries[detailIndex].data ?? []
                        : []

                    return (
                      <Fragment key={item.id}>
                        <tr className={`rfq-main-row ${isExpanded ? 'expanded' : ''}`}>
                          <td colSpan={8} className="rfq-summary-cell">
                            <div className="rfq-summary-row" >
                              <div className="rfq-summary-main" >
                                <button type="button" className="rfq-expand-button" onClick={() => toggleRow(item.id)} aria-label={isExpanded ? 'Collapse row' : 'Expand row'}>
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <span className="rfq-summary-id">{item.part_number}</span>
                                <span className="rfq-brand-tag">{item.brand}</span>
                                <span className="rfq-package-tag">{item.package}</span>
                              </div>

                              <div className="rfq-summary-actions">
                                {/* <EllipsisVertical size={12} /> */}
                                <button type="button" className="rfq-row-button" onClick={() => openRfqMainRowEditPage(item)} style={{ display: 'none' }}>
                                  <Pencil size={10} />编辑
                                </button>
                                <button type="button" className="rfq-row-button danger" onClick={() => deleteRfqMain(item)} style={{ display: 'none' }}>
                                  <Trash2 size={10} />删除
                                </button>
                                <span className="rfq-summary-meta">询价时间 {String(item.createdAt).slice(0, 10)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="rfq-detail-row">
                            <td colSpan={8} className="rfq-detail-cell">
                              <RfqDetailPanel
                                details={details}
                                onEdit={openDetailRowEditor}
                                onDeleteDetail={deleteDetailRow}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="rfq-footer-bar">
            <div className="rfq-footer-summary">
              共 {totalRfqCount} 个型号
            </div>

            <RfqPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      <RfqDrawer
        open={detailDrawerOpen}
        title="Edit Detail"
        onClose={closeDetailDrawer}
        onSave={saveDetailRow}
        initialValues={editingDetailValues ?? undefined}
        itemName={detailDrawerItemName}
      />
    </>
  )
}

export default RfqPage
