import apiClient from '../../lib/api/client'
export const ScrapeApi = {
    async list() {
        const { data } = await apiClient.get(`/scrapeitems/list`)
        if (data?.success) {
            return data.data
        }
    },
    async delete(id: number) {
        const { data } = await apiClient.delete(`/scrapeitems/delete/${id}`)
        if (data?.success) {
            return
        }
    }
}