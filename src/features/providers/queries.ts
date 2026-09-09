import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { providersApi, type ProviderFilters } from '../../api/providers.api';

export function usePublicProvider(slug: string | undefined) {
  return useQuery({
    queryKey: ['provider', 'public', slug],
    queryFn: () => providersApi.getPublicBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useInfiniteProviders(filters: Omit<ProviderFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['providers', 'infinite', filters],
    queryFn: ({ pageParam }) => providersApi.getAllPublic({ ...filters, page: pageParam, limit: filters.limit ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined),
  });
}
