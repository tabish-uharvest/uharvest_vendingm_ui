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
  machineId: string; // Add machine ID to store
  inventoryData: any; // Store inventory data for calorie calculations
  
  // Actions
  setCategory: (category: string) => void;
  setSelectedItem: (item: MenuItem) => void;
  updateAddon: (addonId: string, name: string, price: number, change: number) => void;
  addToCart: () => void;
  resetApp: () => void;
  setOrderId: (orderId: string) => void;
  calculateTotal: () => number;
  calculateCalories: () => number;
  setSelectedTab: (tab: string) => void;
  setMachineId: (machineId: string) => void;
  setInventoryData: (data: any) => void; // Set inventory data
  createOrderData: () => any; // Helper to create order data for API
}

export const useVendingStore = create<VendingMachineState>((set, get) => ({
  currentCategory: '',
  selectedItem: null,
  addons: [],
  cart: [],
  orderTotal: 0,
  currentOrderId: null,
  selectedTab: 'originals',
  machineId: 'c2d72758-ad10-4906-bea7-5b44530f036a', // Default machine ID (you can change this)
  inventoryData: null, // Initialize as null

  setCategory: (category) => set({ currentCategory: category }),
  
  setSelectedItem: (item) => set((state) => {
    // Only reset addons if selecting a different item
    const shouldResetAddons = !state.selectedItem || state.selectedItem.id !== item.id;
    
    return {
      selectedItem: item,
      addons: shouldResetAddons ? [] : state.addons // Only reset addons when selecting a different item
    };
  }),
  
  updateAddon: (addonId, name, price, change) => set((state) => {
    console.log('updateAddon called:', { addonId, name, price, change });
    console.log('Current addons before update:', state.addons);
    
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
    
    console.log('New addons after update:', newAddons);
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
      // Don't reset selectedItem and addons here - they're needed for order creation
      // selectedItem: null,
      // addons: []
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

  calculateCalories: () => {
    const state = get();
    if (!state.selectedItem) return 0;
    
    // Helper function to find addon calorie data
    const getAddonCalories = (addonId: string) => {
      if (!state.inventoryData?.addons) return 95; // fallback
      const addon = state.inventoryData.addons.find((add: any) => add.id === addonId);
      return addon ? parseFloat(addon.calories_per_unit) : 95; // calories per unit
    };

    // Get base item calories
    const itemCalories = Number(state.selectedItem.calories) || 0;
    
    // Calculate addon calories using actual API data: 1 unit = calories_per_unit from API
    const addonCalories = state.addons.reduce((sum, addon) => {
      const caloriesPerUnit = getAddonCalories(addon.id);
      return sum + (addon.quantity * caloriesPerUnit);
    }, 0);
    
    return itemCalories + addonCalories;
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
  
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  setMachineId: (machineId) => set({ machineId }),
  
  setInventoryData: (data) => set({ inventoryData: data }),
  
  createOrderData: () => {
    const state = get();
    if (!state.selectedItem) return null;

    console.log('=== Creating Order Data ===');
    console.log('Selected Item:', state.selectedItem);
    console.log('Current Addons:', state.addons);

    // Helper function to find ingredient calorie data
    const getIngredientCalories = (ingredientId: string) => {
      if (!state.inventoryData?.ingredients) return 1; // fallback
      const ingredient = state.inventoryData.ingredients.find((ing: any) => ing.id === ingredientId);
      return ingredient ? parseFloat(ingredient.calories_per_unit) : 1; // calories per gram
    };

    // Helper function to find addon calorie data
    const getAddonCalories = (addonId: string) => {
      if (!state.inventoryData?.addons) return 95; // fallback
      const addon = state.inventoryData.addons.find((add: any) => add.id === addonId);
      return addon ? parseFloat(addon.calories_per_unit) : 95; // calories per unit
    };

    // Calculate total calories from item and addons  
    let itemCalories = 0;
    
    // Calculate item calories from ingredients if available
    if ((state.selectedItem as any).isCustomRecipe && (state.selectedItem as any).customIngredients) {
      const customIngredients = (state.selectedItem as any).customIngredients;
      itemCalories = customIngredients.reduce((sum: number, ingredient: any) => {
        const inventoryItem = state.inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
        if (inventoryItem) {
          const percentageIncrements = ingredient.percentage / 10;
          const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
          const caloriesPerGram = parseFloat(inventoryItem.calories_per_unit);
          return sum + Math.round(gramsUsed * caloriesPerGram);
        }
        return sum;
      }, 0);
    } else if ((state.selectedItem as any).isPresetRecipe && (state.selectedItem as any).customIngredients) {
      const presetIngredients = (state.selectedItem as any).customIngredients;
      itemCalories = presetIngredients.reduce((sum: number, ingredient: any) => {
        const inventoryItem = state.inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
        if (inventoryItem) {
          const percentageIncrements = ingredient.percentage / 10;
          const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
          const caloriesPerGram = parseFloat(inventoryItem.calories_per_unit);
          return sum + Math.round(gramsUsed * caloriesPerGram);
        }
        return sum;
      }, 0);
    } else {
      // For regular preset items, use the item's calories
      itemCalories = Number(state.selectedItem.calories) || 0;
    }
    
    // Calculate addon calories using actual API data: 1 unit = calories_per_unit from API
    const addonCalories = state.addons.reduce((sum, addon) => {
      const caloriesPerUnit = getAddonCalories(addon.id);
      return sum + (addon.quantity * caloriesPerUnit);
    }, 0);
    const totalCalories = itemCalories + addonCalories;

    // Generate unique session ID per order with date and time
    const now = new Date();
    const dateTime = now.toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0]; // Format: YYYYMMDD-HHMMSS
    const randomId = Math.random().toString(36).substr(2, 6); // 6 char random string
    
    // Determine order type based on item category and source
    const isCustomRecipe = (state.selectedItem as any).isCustomRecipe;
    const isPresetRecipe = (state.selectedItem as any).isPresetRecipe;
    const isSmoothie = state.selectedItem.category === 'smoothies' || state.selectedItem.category === 'smoothie';
    
    let orderType = '';
    if (isSmoothie) {
      orderType = isCustomRecipe ? 'smoothie-custom' : 'smoothie-preset';
    } else {
      orderType = isCustomRecipe ? 'salad-custom' : 'salad-preset';
    }
    
    const sessionId = `${orderType}-${dateTime}-${randomId}`;

    // Format ingredients based on item type
    const ingredients = [];
    
    // If this is a custom recipe, use the custom ingredients
    if ((state.selectedItem as any).isCustomRecipe && (state.selectedItem as any).customIngredients) {
      const customIngredients = (state.selectedItem as any).customIngredients;
      for (const ingredient of customIngredients) {
        // Calculate grams used: each 10% = min_qty_g grams (matching CreateTabContent logic)
        const inventoryItem = state.inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
        if (inventoryItem) {
          const percentageIncrements = ingredient.percentage / 10; // Number of 10% increments
          const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
          const caloriesPerGram = parseFloat(inventoryItem.calories_per_unit);
          const ingredientCalories = Math.round(gramsUsed * caloriesPerGram);
          
          ingredients.push({
            ingredient_id: ingredient.id,
            grams_used: Math.round(gramsUsed),
            calories: ingredientCalories
          });
        }
      }
    } else if ((state.selectedItem as any).isPresetRecipe && (state.selectedItem as any).customIngredients) {
      // If this is a preset recipe with fetched ingredients, use the actual API data
      const presetIngredients = (state.selectedItem as any).customIngredients;
      
      // Check if we have raw preset data with grams_used and calories
      if ((state.selectedItem as any).presetIngredients) {
        // Use the raw preset data from API which has correct grams_used and calories
        const rawPresetIngredients = (state.selectedItem as any).presetIngredients;
        for (const ingredient of rawPresetIngredients) {
          ingredients.push({
            ingredient_id: ingredient.ingredient_id,
            grams_used: ingredient.grams_used,
            calories: ingredient.calories
          });
        }
      } else {
        // Fallback to calculation method if raw data not available
        for (const ingredient of presetIngredients) {
          const inventoryItem = state.inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
          if (inventoryItem) {
            const percentageIncrements = ingredient.percentage / 10;
            const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
            const caloriesPerGram = parseFloat(inventoryItem.calories_per_unit);
            const ingredientCalories = Math.round(gramsUsed * caloriesPerGram);
            
            ingredients.push({
              ingredient_id: ingredient.id,
              grams_used: Math.round(gramsUsed),
              calories: ingredientCalories
            });
          }
        }
      }
    } else {
      // For regular preset items, we might need to handle differently
      // For now, create a placeholder ingredient entry
      ingredients.push({
        ingredient_id: "preset-item-" + state.selectedItem.id,
        grams_used: 500,
        calories: Number(state.selectedItem.calories) || 0
      });
    }

    // Format addons based on user selections from customization page
    console.log('createOrderData - Current addons in state:', state.addons);
    const addons = state.addons.map(addon => {
      const caloriesPerUnit = getAddonCalories(addon.id); // Use actual API data
      const addonCalories = addon.quantity * caloriesPerUnit;
      
      console.log(`Processing addon: ${addon.name}, quantity: ${addon.quantity}, calories per unit: ${caloriesPerUnit}, total calories: ${addonCalories}`);
      
      return {
        addon_id: addon.id,
        qty: addon.quantity, // User selected quantity
        calories: addonCalories // Use actual calories from inventory API
      };
    });

    console.log('Final addons for order:', addons);

    // Build liquids array from custom recipe
    const liquids = [];
    if ((state.selectedItem as any).customLiquids && Array.isArray((state.selectedItem as any).customLiquids)) {
      liquids.push(...(state.selectedItem as any).customLiquids);
    }

    console.log('Final liquids for order:', liquids);

    const orderData = {
      machine_id: state.machineId,
      total_price: state.calculateTotal().toFixed(2),
      total_calories: totalCalories,
      status: "pending",
      session_id: sessionId,
      ingredients,
      addons,
      liquids
    };

    console.log('=== Final Order Data ===');
    console.log('Order Data:', orderData);
    console.log('Total Price from calculateTotal():', state.calculateTotal());
    console.log('Total Calories:', totalCalories);
    console.log('Item Calories:', itemCalories);
    console.log('Addon Calories:', addonCalories);

    return orderData;
  }
}));
