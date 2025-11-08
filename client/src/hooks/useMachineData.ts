import { useQuery, useMutation } from '@tanstack/react-query';
import { MachineInventory, PresetsResponse } from '@shared/schema';

// Frontend server base URL
const API_BASE_URL = 'http://localhost:5001';

// Hook for getting machine inventory (ingredients and addons)
export function useMachineInventory(machineId: string) {
  return useQuery<MachineInventory>({
    queryKey: [`${API_BASE_URL}/api/machines/${machineId}/inventory`],
    enabled: !!machineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds to keep inventory fresh
  });
}

// Hook for getting machine presets
export function useMachinePresets(machineId: string, category?: 'smoothie' | 'salad') {
  const url = category 
    ? `${API_BASE_URL}/api/machines/${machineId}/presets?category=${category}`
    : `${API_BASE_URL}/api/machines/${machineId}/presets`;
    
  return useQuery<PresetsResponse>({
    queryKey: [url],
    enabled: !!machineId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting specific preset details with ingredients
export function usePresetDetails(presetId: string) {
  return useQuery({
    queryKey: [`${API_BASE_URL}/api/presets/${presetId}`],
    enabled: !!presetId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Alias for backwards compatibility and simpler naming
export function usePresets(machineId: string, category?: 'smoothie' | 'salad') {
  return useMachinePresets(machineId, category);
}

// Helper hook to get available ingredients for the Create tab
export function useAvailableIngredients(machineId: string) {
  const { data: inventory, isLoading, error } = useMachineInventory(machineId);
  
  const availableIngredients = inventory?.ingredients?.filter(ingredient => 
    ingredient.is_available && !ingredient.is_low_stock
  ) || [];
  
  return {
    ingredients: availableIngredients,
    isLoading,
    error,
    machine: inventory ? {
      id: inventory.machine_id,
      location: inventory.machine_location,
      status: inventory.machine_status,
      lastUpdated: inventory.last_updated
    } : null
  };
}

// Helper hook to get available addons
export function useAvailableAddons(machineId: string) {
  const { data: inventory, isLoading, error } = useMachineInventory(machineId);
  
  const availableAddons = inventory?.addons?.filter(addon => 
    addon.is_available && !addon.is_low_stock
  ) || [];
  
  return {
    addons: availableAddons,
    isLoading,
    error
  };
}

// Hook for creating orders (uses machine API endpoint)
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error(`Order creation failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
  });
}

// Hook for updating order status
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Status update failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
  });
}

// Hook for getting order details
export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    staleTime: 0, // Always fetch fresh order status
    refetchInterval: 2000, // Poll every 2 seconds for status updates
  });
}
