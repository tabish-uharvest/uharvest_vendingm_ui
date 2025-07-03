import { apiRequest } from './queryClient';
import { MenuItem, Addon, Order, InsertOrder } from '@shared/schema';

export const api = {
  // Menu Items
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await apiRequest('GET', '/api/menu');
    return response.json();
  },

  getMenuItemsByCategory: async (category: string): Promise<MenuItem[]> => {
    const response = await apiRequest('GET', `/api/menu/${category}`);
    return response.json();
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const response = await apiRequest('GET', `/api/menu/item/${id}`);
    return response.json();
  },

  // Add-ons
  getAddons: async (): Promise<Addon[]> => {
    const response = await apiRequest('GET', '/api/addons');
    return response.json();
  },

  // Orders
  createOrder: async (orderData: InsertOrder): Promise<Order> => {
    const response = await apiRequest('POST', '/api/orders', orderData);
    return response.json();
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiRequest('GET', `/api/orders/${id}`);
    return response.json();
  }
};
