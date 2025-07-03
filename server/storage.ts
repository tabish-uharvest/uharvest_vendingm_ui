import { menuItems, addons, orders, type MenuItem, type Addon, type Order, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  
  // Add-ons
  getAddons(): Promise<Addon[]>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<string, MenuItem>;
  private addons: Map<string, Addon>;
  private orders: Map<string, Order>;

  constructor() {
    this.menuItems = new Map();
    this.addons = new Map();
    this.orders = new Map();
    this.initializeDummyData();
  }

  private initializeDummyData() {
    // Initialize menu items
    const smoothies: MenuItem[] = [
      {
        id: 'blueberry-blast',
        name: 'Blueberry Blast',
        category: 'smoothies',
        price: '8.99',
        calories: 280,
        description: 'Rich blueberries with creamy yogurt',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      },
      {
        id: 'orange-twist',
        name: 'Orange Twist',
        category: 'smoothies',
        price: '7.99',
        calories: 250,
        description: 'Fresh orange juice with tropical flavors',
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      },
      {
        id: 'mango-magic',
        name: 'Mango Magic',
        category: 'smoothies',
        price: '9.99',
        calories: 320,
        description: 'Tropical mango with coconut milk',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      },
      {
        id: 'mango-magic1',
        name: 'Mango Magic1',
        category: 'smoothies',
        price: '9.99',
        calories: 320,
        description: 'Tropical mango with coconut milk',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      }
    ];

    const salads: MenuItem[] = [
      {
        id: 'caesar-crunch',
        name: 'Caesar Crunch',
        category: 'salads',
        price: '12.99',
        calories: 320,
        description: 'Classic caesar with crispy croutons',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      },
      {
        id: 'quinoa-power',
        name: 'Quinoa Power',
        category: 'salads',
        price: '13.99',
        calories: 380,
        description: 'Protein-packed quinoa with mixed vegetables',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      },
      {
        id: 'green-detox',
        name: 'Green Detox',
        category: 'salads',
        price: '11.99',
        calories: 180,
        description: 'Fresh greens with detox superfoods',
        image: 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
      }
    ];

    [...smoothies, ...salads].forEach(item => {
      this.menuItems.set(item.id, item);
    });

    // Initialize add-ons
    const addonList: Addon[] = [
      { id: 'pistachio', name: 'Pistachio', price: '1.50', icon: '🥜' },
      { id: 'almond', name: 'Almond', price: '1.25', icon: '🥜' },
      { id: 'chia-seeds', name: 'Chia Seeds', price: '1.00', icon: '🌱' },
      { id: 'protein-powder', name: 'Protein Powder', price: '2.00', icon: '💪' },
      { id: 'honey', name: 'Honey', price: '0.75', icon: '🍯' }
    ];

    addonList.forEach(addon => {
      this.addons.set(addon.id, addon);
    });
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.category === category);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async getAddons(): Promise<Addon[]> {
    return Array.from(this.addons.values());
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = `UH-2024-${Date.now().toString().slice(-6)}`;
    const order: Order = {
      ...orderData,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
    }
    return order;
  }
}

export const storage = new MemStorage();
