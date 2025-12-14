import { TransportProvider } from '@connectrpc/connect-query';
import { useMemo, useRef, type ReactNode } from 'react';
import { useAccessToken } from './auth0';
import { createAuthenticatedTransport } from './connect';
import { useTenant, TenantProvider } from './TenantContext';

interface AuthenticatedTransportProviderProps {
  children: ReactNode;
}

/**
 * Inner component that has access to tenant context.
 */
function TransportWithTenant({ children }: { children: ReactNode }) {
  const { getToken } = useAccessToken();
  const { currentTenantId } = useTenant();

  // Use a ref to always get the latest tenant ID without recreating transport
  const tenantIdRef = useRef<bigint | null>(currentTenantId);
  tenantIdRef.current = currentTenantId;

  // Memoize the transport - the interceptor uses the ref to get latest tenant ID
  const transport = useMemo(
    () => createAuthenticatedTransport(getToken, () => tenantIdRef.current),
    [getToken]
  );

  return <TransportProvider transport={transport}>{children}</TransportProvider>;
}

/**
 * Transport provider that automatically includes the Auth0 access token
 * and tenant ID in all Connect-RPC requests.
 */
export function AuthenticatedTransportProvider({ children }: AuthenticatedTransportProviderProps) {
  return (
    <TenantProvider>
      <TransportWithTenant>{children}</TransportWithTenant>
    </TenantProvider>
  );
}

