import { API_MOCK_DELAY } from './constants';

// Add a small delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Main API client function
export const apiClient = async <T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { timeout = 30000, ...fetchOptions } = options;
  
  // Ensure token is included for authenticated requests
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  // Add token to headers if available (for future real auth)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Simulate network delay
    await delay(API_MOCK_DELAY);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// GET request
export const apiGet = async <T>(url: string): Promise<T> => {
  return apiClient<T>(url, { method: 'GET' });
};

// POST request
export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  return apiClient<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PATCH request
export const apiPatch = async <T>(url: string, data?: unknown): Promise<T> => {
  return apiClient<T>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE request
export const apiDelete = async <T>(url: string): Promise<T> => {
  return apiClient<T>(url, { method: 'DELETE' });
};

// Build query string from object
export const buildQueryString = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.set(key, String(value));
      }
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Storage utilities
export const storage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  setUser: (user: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  
  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};
