import { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Custom replacer for JSON.stringify that handles BigInt serialization.
 * BigInt values are converted to strings with a "n" suffix to maintain uniqueness.
 */
function bigIntReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }
  return value;
}

/**
 * Custom query key hash function that supports BigInt values.
 * React Query's default hashKey uses JSON.stringify which throws on BigInt.
 */
function queryKeyHashFn(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, bigIntReplacer);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With Connect-RPC, we get proper error handling
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: true, // Refetch when user returns to the app
      queryKeyHashFn,
    },
    mutations: {
      // Mutations also need the custom hash function
    },
  },
});

