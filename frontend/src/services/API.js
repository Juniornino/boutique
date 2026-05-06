import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers.Accept = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const url = originalRequest?.url || '';

    // Tenter un refresh silencieux sur 401 (hors routes d'auth)
    if (status === 401 && !url.includes('/auth/') && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(api(originalRequest)), reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/connexion?expired=1';
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      } finally {
        isRefreshing = false;
      }
    }

    const message = error?.response?.data?.message || error.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

const unwrap = (response) => response?.data?.data;
const unwrapPagination = (response) => ({
  data: response?.data?.data || [],
  pagination: response?.data?.pagination || { page: 0, limit: 20, total: 0, totalPages: 1 }
});

export const productAPI = {
  getProducts: async (params = {}) => unwrap(await api.get('/products', { params })) || [],
  getProductById: async (id) => unwrap(await api.get(`/products/${id}`)),
  getStoreSettings: async () => unwrap(await api.get('/products/store-settings')) || { name: '', email: '', phone: '', description: '' },
};

export const orderAPI = {
  getMyOrders: async (params = {}) => unwrap(await api.get('/orders/my', { params })) || [],
};

export const cartAPI = {
  getCart: async () => unwrap(await api.get('/cart')) || [],
  addToCart: async (payload) => unwrap(await api.post('/cart', payload)) || [],
  updateCartItem: async (productId, payload) => unwrap(await api.put(`/cart/${productId}`, payload)) || [],
  removeCartItem: async (productId) => unwrap(await api.delete(`/cart/${productId}`)) || [],
  clearCart: async () => (await api.delete('/cart')).data,
};

export const checkoutAPI = {
  createSession: async (payload) => unwrap(await api.post('/checkout/session', payload)),
  getPaymentStatus: async (reference) => unwrap(await api.get(`/checkout/session/${reference}`)),
};

export const adminAPI = {
  getOrders: async (params = {}) => unwrap(await api.get('/admin/orders', { params })) || [],
  getOrdersPaginated: async (params = {}) => unwrapPagination(await api.get('/admin/orders', { params })),
  deleteOrder: async (orderId) => (await api.delete(`/admin/orders/${orderId}`)).data,
  getProductsPaginated: async (params = {}) => unwrapPagination(await api.get('/admin/products', { params })),
  getCustomersPaginated: async (params = {}) => unwrapPagination(await api.get('/admin/customers', { params })),
  getProductKeys: async (productId, params = {}) =>
    unwrap(await api.get(`/admin/products/${productId}/keys`, { params })) || [],
  bulkImportKeys: async (productId, keys) =>
    (await api.post(`/admin/products/${productId}/keys`, { keys })).data,
  uploadProductImage: async (productId, file) => {
    const fd = new FormData();
    fd.append('image', file);
    return (await api.post(`/admin/products/${productId}/image`, fd, { timeout: 90000 })).data;
  },
  updateKey: async (productId, keyId, code) =>
    (await api.put(`/admin/products/${productId}/keys/${keyId}`, { code })).data,
  deleteKey: async (productId, keyId) =>
    (await api.delete(`/admin/products/${productId}/keys/${keyId}`)).data,
  createProduct: async (payload) => 
    unwrap(await api.post('/admin/products', payload)),
  updateProduct: async (productId, payload) =>
    (await api.put(`/admin/products/${productId}`, payload)).data,
  deleteProduct: async (productId) =>
    (await api.delete(`/admin/products/${productId}`)).data,
  refundOrder: async (orderId) =>
    (await api.post(`/admin/orders/${orderId}/refund`)).data,
  updateProfile: async (payload) =>
    (await api.put('/admin/profile', payload)).data,
  getSettings: async () => unwrap(await api.get('/admin/settings')) || { name: '', email: '', phone: '', description: '' },
  updateSettings: async (payload) => (await api.put('/admin/settings', payload)).data,
  getActivities: async (params = {}) => unwrap(await api.get('/admin/activities', { params })) || [],
  getNotificationsSummary: async () => unwrap(await api.get('/admin/notifications/summary')) || { count: 0 },
};

export const authAPI = {
  register: async (payload) => (await api.post('/auth/register', payload)).data,
  login: async (payload) => (await api.post('/auth/login', payload)).data,
  logout: async () => (await api.post('/auth/logout')).data,
  forgotPassword: async (payload) => (await api.post('/auth/forgot-password', payload)).data,
  resetPassword: async (payload) => (await api.post('/auth/reset-password', payload)).data,
  me: async () => unwrap(await api.get('/auth/me')),
};

export default api;
