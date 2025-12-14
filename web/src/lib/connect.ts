import type { Interceptor } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';

// Create a transport for Connect-RPC
// In development, we use localhost:8080 where the Go server runs
// In production, the API is served from the same origin
const baseUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

/**
 * Creates an auth interceptor that adds the Authorization header to requests.
 */
export function createAuthInterceptor(getToken: () => Promise<string | null>): Interceptor {
  return (next) => async (req) => {
    const token = await getToken();
    if (token) {
      req.header.set('Authorization', `Bearer ${token}`);
    }
    return next(req);
  };
}

/**
 * Creates a tenant interceptor that adds the X-Tenant-ID header to requests.
 */
export function createTenantInterceptor(getTenantId: () => bigint | null): Interceptor {
  return (next) => async (req) => {
    const tenantId = getTenantId();
    if (tenantId !== null) {
      req.header.set('X-Tenant-ID', tenantId.toString());
    }
    return next(req);
  };
}

/**
 * Creates a Connect transport with authentication and tenant context.
 */
export function createAuthenticatedTransport(
  getToken: () => Promise<string | null>,
  getTenantId: () => bigint | null = () => null
) {
  return createConnectTransport({
    baseUrl,
    interceptors: [createAuthInterceptor(getToken), createTenantInterceptor(getTenantId)],
  });
}

/**
 * Default transport without authentication (for unauthenticated routes).
 * @deprecated Use createAuthenticatedTransport with AuthenticatedTransportProvider instead.
 */
export const transport = createConnectTransport({
  baseUrl,
});
