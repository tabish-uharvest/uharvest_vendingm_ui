import { create } from 'zustand';
import { MenuItem, SelectedAddon, CartItem } from '@shared/schema';

interface VendingMachineState {
  currentCategory: string;
  selectedItem: MenuItem | null;
  addons: SelectedAddon[];
  cart: CartItem[];
  orderTotal: number;
  currentOrderId: string | null;
  selectedTab: string;
  
  // Actions
  setCategory: (category: string) => void;
  setSelectedItem: (item: MenuItem) => void;
  updateAddon: (addonId: string, name: string, price: number, change: number) => void;
  addToCart: () => void;
  resetApp: () => void;
  setOrderId: (orderId: string) => void;
  calculateTotal: () => number;
  setSelectedTab: (tab: string) => void;
}

export const useVendingStore = create<VendingMachineState>((set, get) => ({
  currentCategory: '',
  selectedItem: null,
  addons: [],
  cart: [],
  orderTotal: 0,
  currentOrderId: null,
  selectedTab: 'originals',

  setCategory: (category) => set({ currentCategory: category }),
  
  setSelectedItem: (item) => set({ 
    selectedItem: item,
    addons: [] // Reset addons when selecting new item
  }),
  
  updateAddon: (addonId, name, price, change) => set((state) => {
    const existingAddon = state.addons.find(a => a.id === addonId);
    let newAddons = [...state.addons];
    
    if (existingAddon) {
      existingAddon.quantity += change;
      if (existingAddon.quantity <= 0) {
        newAddons = newAddons.filter(a => a.id !== addonId);
      }
    } else if (change > 0) {
      newAddons.push({
        id: addonId,
        name,
        price,
        quantity: 1
      });
    }
    
    return { addons: newAddons };
  }),
  
  addToCart: () => set((state) => {
    if (!state.selectedItem) return state;

    const cartItem: CartItem = {
      id: Math.random().toString(),
      item: state.selectedItem,
      addons: state.addons,
      total: state.calculateTotal()
    };

    return {
      cart: [...state.cart, cartItem],
      selectedItem: null,
      addons: []
    };
  }),
  
  calculateTotal: () => {
    const state = get();
    if (!state.selectedItem) return 0;
    
    const addonsTotal = state.addons.reduce((sum, addon) => {
      return sum + (addon.price * addon.quantity);
    }, 0);
    
    return Number(state.selectedItem.price) + addonsTotal;
  },
  
  resetApp: () => set({
    currentCategory: '',
    selectedItem: null,
    addons: [],
    cart: [],
    orderTotal: 0,
    currentOrderId: null,
    selectedTab: 'originals' // reset to default tab
  }),
  
  setOrderId: (orderId) => set({ currentOrderId: orderId }),
  
  setSelectedTab: (tab) => set({ selectedTab: tab })
}));
