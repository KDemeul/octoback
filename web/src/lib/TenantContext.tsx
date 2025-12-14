import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Tenant } from '../gen/octoback/tenants/v1/tenants_pb';

const TENANT_STORAGE_KEY = 'octoback_current_tenant_id';

interface TenantContextValue {
  currentTenantId: bigint | null;
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentTenantById: (tenantId: bigint | null) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Provider that manages the currently selected tenant.
 * Persists selection to localStorage and invalidates queries on tenant change.
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const queryClient = useQueryClient();
  const [currentTenantId, setCurrentTenantIdState] = useState<bigint | null>(() => {
    const stored = localStorage.getItem(TENANT_STORAGE_KEY);
    if (stored) {
      try {
        return BigInt(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);

  // Persist tenant ID to localStorage
  useEffect(() => {
    if (currentTenantId !== null) {
      localStorage.setItem(TENANT_STORAGE_KEY, currentTenantId.toString());
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  }, [currentTenantId]);

  const setCurrentTenant = (tenant: Tenant | null) => {
    const newTenantId = tenant?.id ?? null;
    const oldTenantId = currentTenantId;

    setCurrentTenantState(tenant);
    setCurrentTenantIdState(newTenantId);

    // Invalidate all queries when tenant changes to refetch with new tenant context
    if (oldTenantId !== newTenantId) {
      // Clear the query cache and refetch
      queryClient.invalidateQueries();
    }
  };

  const setCurrentTenantById = (tenantId: bigint | null) => {
    const oldTenantId = currentTenantId;
    setCurrentTenantIdState(tenantId);
    setCurrentTenantState(null); // Clear tenant object, will be resolved later

    if (oldTenantId !== tenantId) {
      queryClient.invalidateQueries();
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenantId,
        currentTenant,
        setCurrentTenant,
        setCurrentTenantById,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access the current tenant context.
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to get the current tenant ID for use in transport interceptors.
 * Returns a getter function to always get the latest value.
 */
export function useCurrentTenantId() {
  const context = useContext(TenantContext);
  return context?.currentTenantId ?? null;
}

