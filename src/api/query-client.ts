import { QueryClient } from '@tanstack/react-query';
import { normalizeApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        const normalized = normalizeApiError(error);
        // Don't burn retries on errors that won't resolve themselves.
        if (['unauthorized', 'forbidden', 'not_found', 'validation'].includes(normalized.kind)) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
