export type InquiryDetailStatus =
  | '待报价'
  | '已报价'
  | '未报价'

export type RfqInquiryDetail = {
  id: number
  inquiry_id: number
  supplier_id: string
  supplier_name: string
  price: string
  quantity: number
  batch: string
  owner: string
  status: InquiryDetailStatus
  remark: string
}

export type RfqMain = {
  id: number
  part_number: string
  package: string
  brand: string
  createdAt: string
  updatedAt: string
}

export type RfqMainRow = RfqMain
export type RfqDetailRow = RfqInquiryDetail
export type RfqDetailCreate = Omit<RfqInquiryDetail, 'id' | 'inquiry_id' | 'supplier_id' | 'supplier_name'>





export const rfqDetailStatusOptions = [
  { value: '待报价', label: '待报价' },
  { value: '已报价', label: '已报价' },
  { value: '未报价', label: '未报价' },
] as const

export const createDefaultDetailDraft = (name?: string): RfqDetailDraft => ({
  supplier_id: '',
  supplier_name: name ?? '',
  batch: '',
  quantity: 0,
  price: '',
  owner: '',
  status: '待报价',
  remark: '',
})

export const toRfqDetailDraft = (detail: RfqInquiryDetail): RfqDetailDraft => ({
  supplier_id: detail.supplier_id,
  supplier_name: detail.supplier_name,
  batch: detail.batch,
  quantity: detail.quantity,
  price: detail.price,
  owner: detail.owner,
  status: detail.status,
  remark: detail.remark,
})

// export const applyRfqDetailDraft = (
//   detail: RfqInquiryDetail,
//   draft: RfqDetailDraft,
// ): RfqInquiryDetail => ({
//   ...detail,
//   ...draft,
//   quantity: Number(draft.quantity) || 0,
// })


export type RfqDetailStatus = '待报价' | '已报价' | '未报价'
export type rfqDetailStatusOptions = 0 | 1 | 2
export const rfqDetailStatusMap: Record<rfqDetailStatusOptions, string> = {
  0: '待报价',
  1: '已报价',
  2: '未报价',
}

export type RfqDetail = {
  id: number;
  inquiry_id: number;
  supplier_id: string;
  supplier_name: string;
  price: string;
  quantity: number;
  batch: string;
  owner: string;
  status: RfqDetailStatus;
  remark: string;
  version: number;
}
// export type RfqDetailDraft = {
//   supplier_id: string
//   supplier_name: string
//   batch: string
//   quantity: string
//   price: string
//   owner: string
//   status: RfqInquiryDetail['status']
//   remark: string
// }
export type RfqDetailDraft = Omit<RfqDetail, 'id' | 'inquiry_id' | 'version'>

export type RfqDetailTemp = {
  id?: number;  // 可选，新建时没有 id，编辑时有
  supplier_id: string;
  supplier_name: string;
  price: string;
  quantity: number;
  batch: string;
  owner: string;
  status: RfqDetailStatus;
  remark: string;
}


export type ScrapItemData = {
  id: number;  // 可选，新建时没有 id，编辑时有
  name: string;
  batch: string;
}