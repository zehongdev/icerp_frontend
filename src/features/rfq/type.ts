// 主表
export type RfqMain = {
    id: number
    part_number: string
    package: string
    brand: string
    createdAt: string
    updatedAt: string
}
export type RfqMainPageResult = {
    items: RfqMain[]
    page: number
    pageSize: number
    total: number
    totalPages: number
}
export type RfqMainPayload = Omit<RfqMain, "id" | "createdAt" | "updatedAt">

export type RfqMainListParams = {
    keyword?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
    sortBy?: 'name'
    sortOrder?: 'asc' | 'desc'
}
export type RfqMainSingleResponse = {
    success: boolean
    data: RfqMain
    message?: string
}
export type RfqMainDeleteResponse = {
    success: boolean
    message?: string
}

// 详情
// 0 待报价 1已报价 2未报价
export type RfqDetailStatus = '待报价' | '已报价' | '未报价'

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
export type RfqDetailListResponse = {
    success: boolean
    data: RfqDetail[]
}

export type RfqUpdateDetailPayload = Omit<RfqDetail, 'id' | 'inquiry_id' | 'version'>
export type RfqCreateDetailPayload = Omit<RfqDetail, 'id' | 'inquiry_id' | 'supplier_name' | 'version'>