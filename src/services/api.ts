const API = import.meta.env.VITE_API_URL;

export const api = {
  // ============================================================
  // PRODUCTS
  // ============================================================

  // Fetch all products
  getProducts: async () => {
    const res = await fetch(`${API}/products`);
    return res.json();
  },

  // Fetch single product
  getProduct: async (id: number) => {
    const res = await fetch(`${API}/products/${id}`);
    return res.json();
  },

  // Create product
  createProduct: async (product: any) => {
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  // Update product
  updateProduct: async (id: number, product: any) => {
    const res = await fetch(`${API}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  // Delete product
  deleteProduct: async (id: number) => {
    await fetch(`${API}/products/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // ORDERS
  // ============================================================

  // Create a new order
  createOrder: async (orderData: any) => {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error("Failed to place order");
    return res.json();
  },

  // Get all orders for a specific user (Profile page)
  getUserOrders: async (userId: number) => {
    const res = await fetch(`${API}/orders/user/${userId}`);
    return res.json();
  },

  // Get all orders (Admin dashboard page)
  getAllOrders: async () => {
    const res = await fetch(`${API}/orders`);
    return res.json();
  },

  // Update status of an order (Admin)
  updateOrderStatus: async (orderId: number, status: string) => {
    const res = await fetch(`${API}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};
