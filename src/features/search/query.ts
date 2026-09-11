import { SearchApi } from './api'
import { useQuery } from '@tanstack/react-query'

export const searchGlobalQueryKey = {
    all: ['searchGlobal']
}
export function useSearchGlobalQuery(keyword: string) {
    return useQuery({
        queryKey: [...searchGlobalQueryKey.all, keyword],
        queryFn: () => SearchApi.globalSearch(keyword),
        enabled: keyword.trim().length >= 2,
        staleTime: 1000 * 60, // 缓存时间为 1 分钟
    })
}