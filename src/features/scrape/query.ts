import { ScrapeApi } from './api'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

export const scrapeItemsQueryKey = {
    all: ['scrapeItems']
}


export function useScrapeItemsQuery() {
    return useQuery({
        queryKey: scrapeItemsQueryKey.all,
        queryFn: ScrapeApi.list,
    })
}

export function useDeleteScrapeItemsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => ScrapeApi.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: scrapeItemsQueryKey.all,
            })
        },
    })
}