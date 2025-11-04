// Configure your Flask backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Products
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
  },

  getProduct: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  createProduct: async (product: any) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  updateProduct: async (id: number, product: any) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return response.json();
  },

  deleteProduct: async (id: number) => {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  createOrder: async (orderData: any) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  getOrders: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders?userId=${userId}`);
    return response.json();
  },

  // User
  getProfile: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return response.json();
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
