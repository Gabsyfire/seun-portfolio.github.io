import axios from 'axios';
import { tokenStore } from '../auth/tokenStore';

export const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth token interceptor ──
const AUTH_SKIP_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/invite/',
  '/api/v1/auth/verify-totp',
  '/api/v1/auth/entra/provision',
];

// Mutex to prevent concurrent refresh-token races
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const rt = tokenStore.getRefreshToken();
  if (!rt) return false;

  try {
    const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: rt });
    tokenStore.setTokens(data.accessToken, data.refreshToken, data.expiresAtUtc);
    return true;
  } catch {
    tokenStore.clear();
    window.location.href = '/';
    return false;
  }
}

async function ensureFreshToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().then(ok => {
      refreshPromise = null;
      if (!ok) throw new Error('refresh_failed');
    });
  }
  try {
    await refreshPromise;
    return true;
  } catch {
    return false;
  }
}

api.interceptors.request.use(async config => {
  const url = config.url ?? '';
  if (AUTH_SKIP_PATHS.some(p => url.startsWith(p))) return config;

  if (tokenStore.hasTokens()) {
    // Auto-refresh if expired (with mutex to avoid races)
    if (tokenStore.isExpired()) {
      const ok = await ensureFreshToken();
      if (!ok) return config;
    }
    const token = tokenStore.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── 401 response interceptor — retry once with a fresh token ──
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      tokenStore.hasTokens() &&
      !AUTH_SKIP_PATHS.some(p => (originalRequest.url ?? '').startsWith(p))
    ) {
      originalRequest._retry = true;
      const ok = await ensureFreshToken();
      if (ok) {
        const token = tokenStore.getAccessToken();
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }

    const msg =
      error.response?.data?.error ??
      error.response?.data?.title ??
      error.message ??
      'An unexpected error occurred';
    if (_onError) _onError(msg);
    return Promise.reject(error);
  },
);

// ── Global error handler bridge ──

let _onError: ((msg: string) => void) | null = null;
export const setApiErrorHandler = (handler: ((msg: string) => void) | null) => {
  _onError = handler;
};

// ── Tenant-scoped helpers ──

export const tenantApi = (tenantId: string) => ({
  // Credentials
  listCredentials: () =>
    api.get(`/api/v1/tenants/${tenantId}/credentials`),
  getCredential: (id: string) =>
    api.get(`/api/v1/tenants/${tenantId}/credentials/${id}`),
  createCredential: (data: Record<string, unknown>) =>
    api.post(`/api/v1/tenants/${tenantId}/credentials`, data),
  updateCredential: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/v1/tenants/${tenantId}/credentials/${id}`, data),
  archiveCredential: (id: string) =>
    api.delete(`/api/v1/tenants/${tenantId}/credentials/${id}`),
  revealCredential: (id: string) =>
    api.post(`/api/v1/tenants/${tenantId}/credentials/${id}/reveal`),
  rotateCredential: (id: string, data: { newPassword: string }) =>
    api.post(`/api/v1/tenants/${tenantId}/credentials/${id}/rotate`, data),

  // Password health
  expiringCredentials: (days = 30) =>
    api.get(`/api/v1/tenants/${tenantId}/credentials/expiring`, { params: { days } }),
  staleCredentials: () =>
    api.get(`/api/v1/tenants/${tenantId}/credentials/stale`),

  // Categories
  listCategories: () =>
    api.get(`/api/v1/tenants/${tenantId}/categories`),
  createCategory: (data: { name: string; icon?: string; sortOrder?: number }) =>
    api.post(`/api/v1/tenants/${tenantId}/categories`, data),
  updateCategory: (id: string, data: { name: string; icon?: string; sortOrder?: number }) =>
    api.put(`/api/v1/tenants/${tenantId}/categories/${id}`, data),
  deleteCategory: (id: string) =>
    api.delete(`/api/v1/tenants/${tenantId}/categories/${id}`),

  // Users
  listUsers: () =>
    api.get(`/api/v1/tenants/${tenantId}/users`),
  addUser: (data: { userId: string; role: string }) =>
    api.post(`/api/v1/tenants/${tenantId}/users`, data),
  updateUserRole: (userId: string, data: { role: string }) =>
    api.put(`/api/v1/tenants/${tenantId}/users/${userId}`, data),
  removeUser: (userId: string) =>
    api.delete(`/api/v1/tenants/${tenantId}/users/${userId}`),

  // Grants
  listGrants: (credentialId: string) =>
    api.get(`/api/v1/tenants/${tenantId}/credentials/${credentialId}/grants`),
  createGrant: (credentialId: string, data: Record<string, unknown>) =>
    api.post(`/api/v1/tenants/${tenantId}/credentials/${credentialId}/grants`, data),
  revokeGrant: (grantId: string) =>
    api.delete(`/api/v1/tenants/${tenantId}/grants/${grantId}`),

  // Audit
  listAudit: (params?: Record<string, unknown>) =>
    api.get(`/api/v1/tenants/${tenantId}/audit`, { params }),

  // Fields
  listFields: (credentialId: string) =>
    api.get(`/api/v1/tenants/${tenantId}/credentials/${credentialId}/fields`),
  revealField: (credentialId: string, fieldId: string) =>
    api.post(`/api/v1/tenants/${tenantId}/credentials/${credentialId}/fields/${fieldId}/reveal`),
});

// ── Organization-level helpers ──

export const orgApi = {
  listUsers: () => api.get('/api/v1/org/users'),
  listTenants: () => api.get('/api/v1/tenants'),
  createTenant: (data: { name: string; slug: string }) =>
    api.post('/api/v1/tenants', data),
  updateTenant: (tenantId: string, data: { name: string }) =>
    api.put(`/api/v1/tenants/${tenantId}`, data),
  deactivateTenant: (tenantId: string) =>
    api.delete(`/api/v1/tenants/${tenantId}`),
};
