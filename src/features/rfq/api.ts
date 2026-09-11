import apiClient from '../../lib/api/client'
import type { RfqMainListParams, RfqMainPageResult, RfqMainPayload, RfqMain, RfqMainSingleResponse, RfqMainDeleteResponse, RfqDetailListResponse, RfqUpdateDetailPayload, RfqCreateDetailPayload } from './type'

export const RfqMainApi = {
    // 主表相关API
    async getByMainId(id: number): Promise<RfqMain> {
        const { data } = await apiClient.get<RfqMainSingleResponse>(`/inquiries/${id}`)
        return data?.success ? data.data : data.data
    },
    async list(params: RfqMainListParams = {}): Promise<RfqMainPageResult> {
        try {
            const { data } = await apiClient.get('/inquiries/list', { params: params })
            if (!data || !data.items) {
                throw new Error('Invalid response from server')
            }
            return data
        } catch (error) {
            console.error('Failed to fetch RFQ list:', error)
            throw error
        }
    },
    async create(payload: RfqMainPayload): Promise<RfqMain> {
        const { data } = await apiClient.post<RfqMainSingleResponse>('/inquiries/create', payload)
        return data?.success ? data.data : data.data
    },
    async update(id: number, payload: RfqMainPayload) {
        const { data } = await apiClient.put<RfqMainSingleResponse>(`/inquiries/update/${id}`, payload)
        return data?.success ? data.data : data.data
    },
    async delete(id: number): Promise<void> {
        const { data } = await apiClient.delete<RfqMainDeleteResponse>(`/inquiries/delete/${id}`)
        if (data?.success) {
            return
        }
    },

    // 询价详情相关API
    async getDetailByRfqMainId(id: number) {
        const { data } = await apiClient.get<RfqDetailListResponse>(`/inquiries/${id}/detail`);
        return data.data
    },
    async updateDetail(id: number, payload: RfqUpdateDetailPayload) {
        const { data } = await apiClient.put(`/inquiries/${id}/detail/update`, payload)
        return data?.success ? data.data : data.data
    },
    async deleteDetail(id: number) {
        const { data } = await apiClient.delete(`/inquiries/${id}/detail/delete`)
        if (data?.success) {
            return
        }
    },
    async createDetail(id: number, payload: RfqCreateDetailPayload) {
        const { data } = await apiClient.post(`/inquiries/${id}/detail/create`, payload)
        return data?.success ? data.data : data.data
    }
}