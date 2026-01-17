const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    console.error('API Error:', errorMessage, errorData);

    // Handle authentication/authorization errors
    // Only redirect for 401 (Unauthorized), not 403 (Forbidden) as 403 might be expected
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login if not already there AND not on homepage
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth') && currentPath !== '/') {
        window.location.href = '/auth';
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  sendOTP: async (mobile: string, role: 'buyer' | 'shopowner') => {
    return apiRequest<{ message: string; mobile: string; otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, role }),
    });
  },

  verifyOTP: async (mobile: string, otp: string, name?: string, role?: 'buyer' | 'shopowner') => {
    return apiRequest<{ message: string; token: string; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp, name, role }),
    });
  },

  signup: async (mobile: string, password: string, name: string, email: string, role: 'buyer' | 'shopowner') => {
    return apiRequest<{ message: string; token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ mobile, password, name, email, role }),
    });
  },

  login: async (mobile: string, password: string) => {
    return apiRequest<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
  },

  getMe: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  updateLocation: async (location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    return apiRequest<{ message: string; location: any }>('/auth/location', {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  },
};

// Shops API
export const shopsAPI = {
  getAll: async (filters?: { category?: string; search?: string; isOpen?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isOpen !== undefined) params.append('isOpen', String(filters.isOpen));

    const query = params.toString();
    return apiRequest<{ shops: any[] }>(`/shops${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<{ shop: any }>(`/shops/${id}`);
  },

  create: async (shopData: any) => {
    return apiRequest<{ shop: any }>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
  },

  update: async (id: string, shopData: any) => {
    return apiRequest<{ shop: any }>(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shopData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/shops/${id}`, {
      method: 'DELETE',
    });
  },

  getMyShops: async () => {
    return apiRequest<{ shops: any[] }>('/shops/owner/my-shops');
  },
};

// Products API
export const productsAPI = {
  getByShop: async (shopId: string, filters?: { category?: string; search?: string; inStock?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.inStock !== undefined) params.append('inStock', String(filters.inStock));

    const query = params.toString();
    return apiRequest<{ products: any[] }>(`/products/shop/${shopId}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<{ product: any }>(`/products/${id}`);
  },

  create: async (productData: any) => {
    return apiRequest<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (id: string, productData: any) => {
    return apiRequest<{ product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  create: async (orderData: any) => {
    return apiRequest<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async () => {
    return apiRequest<{ orders: any[] }>('/orders/my-orders');
  },

  getShopOrders: async (shopId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    if (status) params.append('status', status);

    const query = params.toString();
    return apiRequest<{ orders: any[] }>(`/orders/shop-orders${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<{ order: any }>(`/orders/${id}`);
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest<{ order: any }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  cancel: async (id: string) => {
    return apiRequest<{ order: any }>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },
};

// Cart API
export const cartAPI = {
  get: async () => {
    return apiRequest<{ items: any[] }>('/cart');
  },

  add: async (product: any, shopId: string, shopName: string, quantity = 1) => {
    return apiRequest<{ items: any[] }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product, shopId, shopName, quantity }),
    });
  },

  update: async (productId: string, quantity: number) => {
    return apiRequest<{ items: any[] }>('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  remove: async (productId: string) => {
    return apiRequest<{ items: any[] }>(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return apiRequest<{ message: string; items: any[] }>('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    return apiRequest<{ user: any }>('/users/profile');
  },

  updateProfile: async (profileData: { name?: string; email?: string }) => {
    return apiRequest<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

