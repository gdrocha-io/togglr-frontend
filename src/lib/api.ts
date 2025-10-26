const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('togglr_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}

// Features API
export const featuresApi = {
  getAll: (params?: { namespace?: string; environment?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/features${query ? `?${query}` : ''}`);
  },
  getByParams: (name: string, namespace: string, environment: string) => {
    const params = new URLSearchParams({ name, namespace, environment });
    return fetchWithAuth(`/features/feature?${params}`);
  },
  create: (data: any) => fetchWithAuth('/features', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => {
    return fetchWithAuth(`/features/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id: number) => {
    return fetchWithAuth(`/features/${id}`, { method: 'DELETE' });
  },
  toggle: (name: string, namespace: string, environment: string, enabled: boolean) => {
    const params = new URLSearchParams({ name, namespace, environment });
    return fetchWithAuth(`/features/feature/toggle?${params}`, { 
      method: 'PATCH', 
      body: JSON.stringify({ enabled }) 
    });
  },
};

// Users API
export const usersApi = {
  getAll: () => fetchWithAuth('/users'),
  getById: (id: string) => fetchWithAuth(`/users/${id}`),
  create: (data: any) => fetchWithAuth('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/users/${id}`, { method: 'DELETE' }),
  changePassword: (currentPassword: string, newPassword: string) => 
    fetchWithAuth('/users/change-password', { 
      method: 'PATCH', 
      body: JSON.stringify({ currentPassword, newPassword }) 
    }),
};

// Environments API
export const environmentsApi = {
  getAll: () => fetchWithAuth('/environments'),
  getById: (id: string) => fetchWithAuth(`/environments/${id}`),
  create: (data: any) => fetchWithAuth('/environments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/environments/${id}`, { method: 'DELETE' }),
};

// Namespaces API
export const namespacesApi = {
  getAll: () => fetchWithAuth('/namespaces'),
  getById: (id: string) => fetchWithAuth(`/namespaces/${id}`),
  create: (data: any) => fetchWithAuth('/namespaces', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/namespaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/namespaces/${id}`, { method: 'DELETE' }),
};

// Metrics API
export const metricsApi = {
  getDashboard: () => fetchWithAuth('/metrics/dashboard'),
};

// Audit API
export const auditApi = {
  getByFeature: (featureId: string, page = 0, size = 10, action?: string, userType?: string, username?: string, dataSource?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'createdAt,desc'
    });
    
    if (action) params.append('action', action);
    if (userType) params.append('user_type', userType);
    if (username) params.append('username', username);
    if (dataSource) params.append('data_source', dataSource);
    
    return fetchWithAuth(`/audit/feature/${featureId}?${params}`);
  },
};
