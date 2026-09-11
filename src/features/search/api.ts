import apiClient from '../../lib/api/client'
import { type GlobalSearchResult } from './type.ts'

export const SearchApi = {
    async globalSearch(keyword: string) {
        const { data } = await apiClient.get<GlobalSearchResult>(`/search/global`, {
            params: {
                keyword,
            },
        })
        return data
    }
}