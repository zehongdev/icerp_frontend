import { ArrowLeft, ChevronDown, Plus, Trash2, CopyPlus, Eraser } from 'lucide-react'
import { Select } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import SupplierInput from '../../components/supplier-input/SupplierInput'
import { supplierApi, type SupplierInputOption } from '../../features/supplier/api'
import {
  createDefaultDetailDraft,
  rfqDetailStatusOptions,
  type RfqDetailTemp,
  type ScrapItemData,
} from './types'
import './Rfq.css'
import { toast } from 'sonner'

import {
  useCreateRfqMainMutation,
  useCreateRfqDetailMutation,
  useRfqMainByIdQuery,
  useRfqDetailsBatchQuery,
  useUpdateRfqMainMutation,
  useUpdateRfqDetailMutation,
  useDeleteRfqDetailMutation
} from '../../features/rfq/queries'
import { useCreateSupplierMutation } from '../../features/supplier/queries'
import { useScrapeItemsQuery, useDeleteScrapeItemsMutation } from '../../features/scrape/query'
import { useConfirm } from '../../components/alert-dialog/ConfirmDialog'

type RfqFormValues = {
  part_number: string
  package: string
  brand: string
}

const createEmptyForm = (): RfqFormValues => ({
  part_number: '',
  package: '',
  brand: '',
})

function RfqDetailSupplierInput({
  value,
  onValueChange,
  onSelect,
}: {
  value: string
  onValueChange: (value: string) => void
  onSelect: (supplier: SupplierInputOption) => void
}) {
  const [options, setOptions] = useState<SupplierInputOption[]>([])
  const [searchedValue, setSearchedValue] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null) // 新增

  useEffect(() => {
    setSearchError(null)
    const controller = new AbortController()
    const keyword = value.trim()
    // 如果关键词为空，清空状态，不发起请求
    if (!keyword) {
      setOptions([])
      setSearchedValue(null)
      return
    }
    const timer = window.setTimeout(() => {
      supplierApi.searchForInput(keyword, controller.signal)
        .then((nextOptions) => {
          if (!controller.signal.aborted) {
            setOptions(nextOptions)
            setSearchedValue(keyword)
            // 成功时清除错误
            setSearchError(null)
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            console.error('Failed to search suppliers:', error)
            setOptions([])
            setSearchedValue(null)
            // 设置网络错误信息
            setSearchError('网络错误，请稍后重试。')
          }
        })
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  const isSupplierNotFound = (
    value.trim().length > 0
    && searchedValue === value.trim()
    && options.length === 0
    && !searchError // 有错误时不显示“不存在”
  )
  const errorMessage = searchError || (isSupplierNotFound ? '供应商不存在。' : null)

  return (
    <>
      <SupplierInput
        value={value}
        options={options}
        onValueChange={onValueChange}
        onSelect={onSelect}
      />
      {errorMessage && <span className="field-error" role="alert">{errorMessage}</span>}
    </>
  )
}

function RfqNewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // const mode = (location.state?.mode as 'create' | 'edit' | undefined) ?? 'create'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalForm, setOriginalForm] = useState<RfqFormValues | null>(null);
  const [originalDetailRows, setOriginalDetailRows] = useState<RfqDetailTemp[]>([]);

  const initialValues = location.state?.initialValues as RfqFormValues | undefined
  const initialDetailRows = location.state?.detailRows as RfqDetailTemp[] | undefined

  const [form, setForm] = useState<RfqFormValues>(() => initialValues ?? createEmptyForm())
  const [detailRows, setDetailRows] = useState<RfqDetailTemp[]>(() => initialDetailRows?.length ? initialDetailRows : [])

  const createRfqMainMutation = useCreateRfqMainMutation();
  const createRfqDetailMutation = useCreateRfqDetailMutation();
  const updateRfqMainMutation = useUpdateRfqMainMutation();
  const updateRfqDetailMutation = useUpdateRfqDetailMutation();
  const deleteRfqDetailMutation = useDeleteRfqDetailMutation();
  const createSupplierMutation = useCreateSupplierMutation();
  const confirm = useConfirm();

  const [searchParams] = useSearchParams();
  const rfqMainIdFromQuery = searchParams.get('rfqmainId');


  // const mode = rfqMainIdFromQuery ? 'edit' : 'create';

  // const isEditMode = mode === 'edit'
  const isEditMode = !!rfqMainIdFromQuery;

  const { data: rfqMainData, isLoading: mainLoading } = useRfqMainByIdQuery(Number(rfqMainIdFromQuery));
  const detailQueries = useRfqDetailsBatchQuery(
    isEditMode && rfqMainData ? [rfqMainData.id] : []
  );

  const { data: scrapeItemsData } = useScrapeItemsQuery();
  const deleteScrapeItemsMutation = useDeleteScrapeItemsMutation();
  const fromExtensionData: ScrapItemData[] = scrapeItemsData?.length ? scrapeItemsData : [];

  const detailsLoading = detailQueries[0]?.isLoading ?? false;
  // 注意：useRfqDetailsBatchQuery 返回的是数组，取第一个查询的数据
  const rfqDetailsData = detailQueries[0]?.data ?? [];

  useEffect(() => {
    if (rfqMainData) {
      const newForm = {
        part_number: rfqMainData.part_number,
        package: rfqMainData.package,
        brand: rfqMainData.brand,
      };
      setForm(newForm);
      setOriginalForm(newForm); // ✅ 保存原始主表数据
    }
  }, [rfqMainData])
  useEffect(() => {
    if (rfqDetailsData.length > 0) {
      const newDetails = rfqDetailsData.map(detail => ({
        id: detail.id,
        quantity: detail.quantity,
        price: detail.price,
        supplier_id: detail.supplier_id,
        supplier_name: detail.supplier_name,
        remark: detail.remark,
        batch: detail.batch,
        owner: detail.owner,
        status: detail.status,
      }));
      setDetailRows(newDetails);
      setOriginalDetailRows(newDetails); // ✅ 保存原始详情列表
    }
  }, [rfqDetailsData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const updateDetailRow = (index: number, updater: (row: RfqDetailTemp) => RfqDetailTemp) => {
    setDetailRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? updater(row) : row)))
  }

  const handleDetailRowChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'price') {
      const trimmed = value.trim();
      // 判断是否非零（不为空且解析后不为 0）
      const isNonZero = trimmed !== '' && !isNaN(parseFloat(trimmed)) && parseFloat(trimmed) !== 0;
      updateDetailRow(index, (row) => ({ ...row, [name]: value, status: isNonZero ? '已报价' : row.status }));
    } else {
      updateDetailRow(index, (row) => ({ ...row, [name]: value }))
    }
  }

  const addDetailRow = () => {
    // const lastRow = detailRows.at(-1)
    // if (
    //   lastRow &&
    //   !lastRow.supplier_id
    // ) {
    //   toast.error('请先选择上一行供应商');
    //   return;
    // }
    setDetailRows(prev => [
      ...prev,
      createDefaultDetailDraft()
    ])
  }

  const removeDetailRow = (index: number) => {
    setDetailRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
  }
  const getMissingSupplierRows = () => {
    return detailRows.filter(
      row =>
        row.supplier_name && row.supplier_name.trim() !== '' &&
        (!row.supplier_id || row.supplier_id.trim() === '')
    );
  };
  // 新增：检查是否有未填写供应商名称的行
  const getEmptySupplierNameRows = () => {
    return detailRows.filter(
      row => !row.supplier_name || row.supplier_name.trim() === ''
    );
  };
  const createMissingSuppliers = async () => {
    // const invalidRows = getInvalidRows();
    const missingRows = getMissingSupplierRows();
    if (missingRows.length === 0) {
      return detailRows;
    }
    const confirmed = await confirm({
      title: '供应商不存在',
      description: `发现 ${missingRows.length} 个供应商不存在，是否创建？`
    });
    if (!confirmed) {
      return null;
    }
    const createdSuppliers = await Promise.all(
      missingRows.map(row =>
        createSupplierMutation.mutateAsync({
          name: row.supplier_name,
          contact: '',
          phone: '',
          email: '',
          address: '',
          remark: '',
          status: 'Active',
        }, {
          onSuccess: () => {
            toast.success(`成功创建 ${missingRows.length} 供应商`);
          },
          onError: (error) => {
            console.error('Failed to create supplier', error);
          }
        })
      )
    );

    const newRows = detailRows.map(row => {
      const index = missingRows.findIndex(
        item => item === row
      );
      if (index !== -1) {
        return {
          ...row,
          supplier_id: createdSuppliers[index].id,
          supplier_name: createdSuppliers[index].name
        };
      }
      return row;
    });
    setDetailRows(newRows);
    return newRows;
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // ----- 1. 业务验证 -----
      const emptyRows = getEmptySupplierNameRows();
      if (emptyRows.length > 0) {
        toast.error('请为所有明细行填写供应商名称。');
        return; // 提前退出，finally 会重置 isSubmitting
      }

      const readyRows = await createMissingSuppliers();
      if (!readyRows) {
        return; // 用户取消创建供应商，不继续
      }

      // ----- 2. 执行保存 -----
      if (isEditMode) {
        const rfqMainId = Number(rfqMainIdFromQuery);

        // 2.1 更新主表（仅当有变化）
        const isMainChanged = JSON.stringify(form) !== JSON.stringify(originalForm);
        if (isMainChanged) {
          await updateRfqMainMutation.mutateAsync({
            id: rfqMainId,
            rfqMain: {
              part_number: form.part_number,
              package: form.package,
              brand: form.brand,
            },
          });
        }

        // 2.2 处理明细：删除、更新、创建
        const originalIds = originalDetailRows.map(row => row.id).filter(id => id !== undefined);
        const currentIds = readyRows.map(row => row.id).filter(id => id !== undefined);
        const deletedIds = originalIds.filter(id => !currentIds.includes(id));

        // 2.2.1 删除（每个删除失败不中断整体，但会提示）
        await Promise.allSettled(
          deletedIds.map(async (id) => {
            const deletedRow = originalDetailRows.find(orig => orig.id === id);
            await deleteRfqDetailMutation.mutateAsync(id);
            toast.success(`RFQ detail ${deletedRow?.supplier_name} deleted successfully!`);
          })
        ).then(results => {
          results.forEach((result, idx) => {
            if (result.status === 'rejected') {
              const deletedRow = originalDetailRows.find(orig => orig.id === deletedIds[idx]);
              toast.error(`Failed to delete RFQ detail ${deletedRow?.supplier_name}. Please try again.`);
            }
          });

        });

        // 2.2.2 创建/更新明细
        await Promise.all(
          readyRows.map(async (row) => {
            const payload = {
              supplier_id: row.supplier_id,
              quantity: row.quantity,
              price: row.price.trim() === '' ? '0.0000' : row.price,
              batch: row.batch,
              owner: row.owner,
              status: row.status,
              remark: row.remark,
            };
            if (row.id) {
              // 更新
              const originalRow = originalDetailRows.find(orig => orig.id === row.id);
              if (originalRow && JSON.stringify(row) === JSON.stringify(originalRow)) {
                return; // 无变化，跳过
              }
              await updateRfqDetailMutation.mutateAsync({
                id: row.id,
                payload: { ...payload, supplier_name: row.supplier_name },
              });
            } else {
              // 新建
              await createRfqDetailMutation.mutateAsync({
                id: rfqMainId,
                payload,
              });
              toast.success(`RFQ details ${row.supplier_name} created successfully!`);
            }
          })
        );

        // 全部成功，导航
        navigate('/rfq');
        toast.success('RFQ updated successfully!');
      } else {
        // ----- 创建模式 -----
        if (readyRows.some(row => !row.supplier_id || row.supplier_id.trim() === '')) {
          toast.error('请确保所有明细行的供应商已选择。');
          return;
        }

        const result = await createRfqMainMutation.mutateAsync({
          part_number: form.part_number,
          package: form.package,
          brand: form.brand,
        });

        await Promise.all(
          readyRows.map(row =>
            createRfqDetailMutation.mutateAsync({
              id: result.id,
              payload: {
                supplier_id: row.supplier_id,
                quantity: row.quantity,
                price: row.price.trim() === '' ? '0.0000' : row.price,
                batch: row.batch,
                owner: row.owner,
                status: row.status,
                remark: row.remark,
              },
            })
          )
        );

        toast.success(`RFQ ${form.part_number} created successfully!`);
        navigate('/rfq');
      }
    } catch (error) {
      // 统一错误处理（捕获所有 API 异常及未预期的错误）
      console.error('Submit error:', error);
      toast.error(isEditMode ? 'Failed to update RFQ.' : 'Failed to create RFQ.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImportScrapeItem = async (item: ScrapItemData) => {
    if (item.name === detailRows.find(row => row.supplier_name === item.name)?.supplier_name) {
      toast.error('该供应商已存在于明细行中。');
      return;
    }
    const suppliername = item.name.trim();
    const supplier = await supplierApi.findByName(suppliername)
    setDetailRows(prev => [
      ...prev,
      {
        ...createDefaultDetailDraft(suppliername),
        supplier_id: supplier?.id ?? '',
        supplier_name: supplier?.name ?? suppliername,
        batch: item.batch ?? '',
      }
    ])
  }

  if (isEditMode && (mainLoading || detailsLoading)) {
    return <div className="loading-spinner">加载中...</div>;
  }
  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-header-stack">
          <button type="button" className="supplier-back-link" onClick={() => navigate('/rfq')}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back RFQ List</span>
          </button>
          <div>
            <p className="detail-label">Procurement</p>
            <h1>{isEditMode ? 'Edit RFQ' : 'Create RFQ'}</h1>
          </div>
        </div>
      </div>

      <div className="rfq-create-layout">
        <form className="rfq-form-shell" onSubmit={handleSubmit}>
          <div className="form-card rfq-main-card">
            <div className="form-grid">
              <label className="field">
                <span>Part Number</span>
                <input name="part_number" value={form.part_number} onChange={handleChange} required />
              </label>
              <label className="field">
                <span>Package</span>
                <input name="package" value={form.package} onChange={handleChange} />
              </label>
              <label className="field">
                <span>Brand</span>
                <input name="brand" value={form.brand} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-card rfq-detail-card">
            <div className="rfq-detail-form-section">
              <div className="rfq-detail-form-header">
                <p className="detail-label">询价明细</p>
                <button type="button" className="rfq-add-row-button" onClick={addDetailRow}>
                  <Plus size={14} aria-hidden="true" />
                  <span>添加行</span>
                </button>
              </div>

              <div className="rfq-detail-table-wrap">
                <table className="rfq-detail-table">
                  <thead>
                    <tr>
                      <th>序号</th>
                      <th>供应商</th>
                      <th>批次</th>
                      <th>数量</th>
                      <th>负责人</th>
                      <th>价格</th>
                      <th>状态</th>
                      <th>备注</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((row, index) => (
                      <tr key={row.id ?? index}>
                        <td className="rfq-detail-row-index">{index + 1}</td>
                        <td>
                          <RfqDetailSupplierInput
                            value={row.supplier_name}
                            onValueChange={(supplierName) => {
                              updateDetailRow(index, (item) => ({
                                ...item,
                                supplier_id: '',
                                supplier_name: supplierName,
                              }))
                            }}
                            onSelect={(supplier) => {
                              updateDetailRow(index, (item) => ({
                                ...item,
                                supplier_id: supplier.id,
                                supplier_name: supplier.name,
                              }))
                            }}
                          />
                        </td>
                        <td>
                          <input name="batch" value={row.batch} onChange={(event) => handleDetailRowChange(index, event)} />
                        </td>
                        <td>
                          <input name="quantity" value={row.quantity} onChange={(event) => handleDetailRowChange(index, event)} pattern="^\d+$" />
                        </td>
                        <td>
                          <input name="owner" value={row.owner} onChange={(event) => handleDetailRowChange(index, event)} />
                        </td>
                        <td>
                          <input name="price" value={row.price} onChange={(event) => handleDetailRowChange(index, event)} pattern="^[0-9]+(\.[0-9]{1,4})?$" placeholder="0.0000" />
                        </td>
                        <td>
                          {/* <Select.Root
                            value={row.status}
                            onValueChange={(value) => {
                              updateDetailRow(index, (item) => ({ ...item, status: value as RfqDetailTemp['status'] }))
                            }}
                          > */}
                          <Select.Root
                            value={row.status}
                            onValueChange={(value) => {
                              updateDetailRow(index, (item) => ({ ...item, status: value as RfqDetailTemp['status'] }))
                            }}
                          >
                            <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-(--surface-2) px-3 text-sm text-(--text) outline-none transition-colors data-placeholder:text-(--muted) focus:border-(--accent)" aria-label="状态">
                              <Select.Value placeholder="待报价" />
                              <Select.Icon className="text-(--muted)">
                                <ChevronDown size={14} aria-hidden="true" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              {/* <Select.Content className="field-select-content" position="popper" sideOffset={8}> */}
                              <Select.Content
                                position="popper"
                                sideOffset={8}
                                className="z-1000 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--border) bg-(--panel-strong) p-1 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
                              >
                                {/* <Select.Viewport className="field-select-viewport">
                                  {rfqDetailStatusOptions.map((option) => (
                                    <Select.Item key={option.value} value={option.value} className="field-select-item">
                                      <Select.ItemText>{option.label}</Select.ItemText>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport> */}
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
                        </td>
                        <td>
                          <input className="rfq-detail-remark-input" name="remark" value={row.remark} onChange={(event) => handleDetailRowChange(index, event)} />
                        </td>
                        <td className="rfq-detail-action-cell">
                          <button type="button" className="rfq-remove-row-button" onClick={() => removeDetailRow(index)} aria-label={`Remove row ${index + 1}`}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => navigate('/rfq')}>Cancel</button>
              <button type="submit" className="primary-button-dark" disabled={isSubmitting}>
                {isSubmitting
                  ? (isEditMode ? 'Updating...' : 'Saving...')
                  : (isEditMode ? 'Update RFQ' : 'Save RFQ')
                }
              </button>
            </div>
          </div>


        </form>


        <aside className="rfq-side-card form-card">
          <div className="rfq-side-card-inner">
            <p className="detail-label">插件助手</p>

            {fromExtensionData.length === 0 ? (
              <p style={{ color: 'rgba(255, 255, 255, 0.18)', fontSize: '14px' }}>没有来自插件助手的数据</p>
            ) : (
              <>
                <div className="rfq-side-placeholder">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr  0.5fr  0.5fr ',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span>供应商</span>
                    <span>批次</span>
                    <span>操作</span>
                  </div>
                  {fromExtensionData.map((item) => (
                    <div key={item.id} className="data-row" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr  0.5fr  0.5fr  ',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'transparent',
                      transition: 'background 0.15s',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#e2e8f0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span>{item.name}</span>
                      <span>{item.batch}</span>
                      <div style={{ display: 'flex' }}>
                        <CopyPlus size={16} style={{ cursor: 'pointer', marginRight: '20px' }} onClick={() => void handleImportScrapeItem(item)} />
                        <Eraser size={16} style={{ cursor: 'pointer' }} onClick={() => {
                          // setFromExtension(prev => prev.filter((_, i) => i !== index))
                          deleteScrapeItemsMutation.mutate(item.id);
                          toast.success('已删除抓取项');
                        }} />
                      </div>
                    </div>
                  ))}

                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', gap: '6px' }}>
                  {/* <button style={{ borderRadius: '8px', padding: '8px 16px', background: '#3b82f6', color: '#ffffff' }}
                    onClick={() => {
                    }}>导入所有</button> */}
                  <button style={{ borderRadius: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.06)', color: '#ffffff' }}
                    onClick={async () => {
                      for (const item of fromExtensionData) {
                        await deleteScrapeItemsMutation.mutate(item.id);
                      }
                      toast.success('已清除所有抓取项');
                    }}>清除所有</button>
                </div>
              </>
            )}
          </div>
        </aside>

      </div >
    </div >
  )
}

export default RfqNewPage
