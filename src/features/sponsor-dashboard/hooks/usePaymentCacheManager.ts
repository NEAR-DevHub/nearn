import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { PaymentCacheManager } from '../utils/cache-invalidation';

/**
 * Custom hook that provides access to the PaymentCacheManager
 * Ensures consistent cache management across payment-related operations
 */
export function usePaymentCacheManager() {
  const queryClient = useQueryClient();

  const cacheManager = useMemo(
    () => new PaymentCacheManager(queryClient),
    [queryClient],
  );

  return cacheManager;
}
