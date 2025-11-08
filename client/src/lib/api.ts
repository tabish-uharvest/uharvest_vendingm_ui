import { apiRequest } from './queryClient';
import { MachineInventory, PresetsResponse } from '@shared/schema';

// Frontend server base URL (which proxies to backend)
const API_BASE_URL = 'http://localhost:5001';

export const api = {
  // Machine API Endpoints (proxied through frontend server)
  machines: {
    // GET - Get machine inventory (ingredients and addons)
    getInventory: async (machineId: string): Promise<MachineInventory> => {
      const response = await apiRequest('GET', `${API_BASE_URL}/api/machines/${machineId}/inventory`);
      return response.json();
    },

    // PUT - Update machine inventory (for future use)
    updateInventory: async (machineId: string, inventoryData: Partial<MachineInventory>): Promise<MachineInventory> => {
      const response = await apiRequest('PUT', `${API_BASE_URL}/api/machines/${machineId}/inventory`, inventoryData);
      return response.json();
    },

    // GET - Get presets for a machine, optionally filtered by category
    getPresets: async (machineId: string, category?: 'smoothie' | 'salad'): Promise<PresetsResponse> => {
      const url = category 
        ? `${API_BASE_URL}/api/machines/${machineId}/presets?category=${category}`
        : `${API_BASE_URL}/api/machines/${machineId}/presets`;
      const response = await apiRequest('GET', url);
      return response.json();
    }
  }
};
