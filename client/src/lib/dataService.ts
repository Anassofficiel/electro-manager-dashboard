// CRITICAL: This is the mock data service that replaces an actual backend.
// It persists all data to localStorage and simulates network latency.
import { v4 as uuidv4 } from 'uuid';

// Types derived from schema
export type Product = {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string;
  tags: string[] | null;
  description: string | null;
  specs: { label: string; value: string }[] | null;
  images: string[] | null;
};

export type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  date: string; // ISO string for easy serialization
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  paymentMethod: string;
  items: { image: string; title: string; qty: number; price: number }[] | null;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  city: string;
  totalOrders: number;
  lastOrderDate: string | null;
};

export type Settings = {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string | null;
  shippingFee: number;
  codDeposit: number;
  theme: string;
};

export type Profile = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

// Storage Keys
const KEYS = {
  PRODUCTS: 'em_products',
  ORDERS: 'em_orders',
  CUSTOMERS: 'em_customers',
  SETTINGS: 'em_settings',
  PROFILE: 'em_profile',
  AUTH: 'em_auth',
};

// --- SIMULATED DELAY ---
const delay = () => new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

// --- SEED DATA GENERATION ---
const seedData = () => {
  if (localStorage.getItem(KEYS.PRODUCTS)) return; // Already seeded

  console.log("Seeding initial mock data...");

  // 1. Products (40 items)
  const categories = ["TVs", "Washing Machines", "Ovens", "Fridges", "Smartphones", "Laptops", "Small Appliances"];
  const brands = ["Samsung", "LG", "Sony", "Bosch", "Apple", "HP", "Dell", "Philips", "Whirlpool", "Panasonic"];
  const adjectives = ["Smart", "Pro", "Ultra", "Max", "Eco", "Series X", "Plus", "Lite"];
  
  const products: Product[] = [];
  for (let i = 1; i <= 40; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const price = Math.floor(Math.random() * 15000) + 500;
    const isDiscounted = Math.random() > 0.6;
    
    products.push({
      id: i,
      title: `${brand} ${adjective} ${category.slice(0, -1)}`,
      brand,
      category,
      price,
      compareAtPrice: isDiscounted ? price + Math.floor(price * 0.2) : null,
      stock: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 100) + 10,
      sku: `SKU-${brand.substring(0,3).toUpperCase()}-${1000+i}`,
      tags: ["Electronics", "New Arrival"],
      description: `Premium ${brand} product featuring state-of-the-art technology.`,
      specs: [
        { label: "Warranty", value: "2 Years" },
        { label: "Power", value: "220V" }
      ],
      // Using picsum seeds for variety
      images: [
        `https://picsum.photos/seed/${i * 10}/800/800`,
        `https://picsum.photos/seed/${i * 10 + 1}/800/800`
      ]
    });
  }

  // 2. Customers (20 items)
  const cities = ["Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Meknes"];
  const customers: Customer[] = [];
  for (let i = 1; i <= 20; i++) {
    customers.push({
      id: i,
      name: `Customer ${i} Name`,
      phone: `+212 600 000 ${i.toString().padStart(3, '0')}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      totalOrders: Math.floor(Math.random() * 5) + 1,
      lastOrderDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    });
  }

  // 3. Orders (20 items)
  const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const orders: Order[] = [];
  for (let i = 1; i <= 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const c = customers[Math.floor(Math.random() * customers.length)];
    const itemQty = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let subtotal = 0;
    
    for(let j=0; j<itemQty; j++) {
      const p = products[Math.floor(Math.random() * products.length)];
      orderItems.push({
        image: p.images?.[0] || "",
        title: p.title,
        qty: 1,
        price: p.price
      });
      subtotal += p.price;
    }

    orders.push({
      id: i,
      customerName: c.name,
      customerPhone: c.phone,
      customerCity: c.city,
      customerAddress: `123 Main St, ${c.city}`,
      date: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
      status,
      subtotal,
      shipping: 50,
      discount: 0,
      total: subtotal + 50,
      paymentMethod: Math.random() > 0.5 ? "Cash on Delivery" : "Credit Card",
      items: orderItems
    });
  }

  // 4. Settings
  const settings: Settings = {
    id: 1,
    storeName: "ELECTRO MANAGER",
    phone: "+212 600 123 456",
    email: "contact@electromanager.com",
    address1: "Tech Boulevard, Casablanca",
    address2: null,
    shippingFee: 50,
    codDeposit: 100,
    theme: "light"
  };

  // 5. Profile
  const profile: Profile = {
    displayName: "Moustpha Admin",
    email: "moustpha@electromanager.com",
    avatarUrl: null
  };

  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

// --- API METHODS ---
export const api = {
  init: () => seedData(),
  
  // Auth
  login: async (email: string) => {
    await delay();
    localStorage.setItem(KEYS.AUTH, 'true');
    // Save email to profile to generate correct avatar letter
    const p = api.getProfileSync();
    if(p) {
      p.email = email;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    }
    return { success: true };
  },
  logout: async () => {
    await delay();
    localStorage.removeItem(KEYS.AUTH);
  },
  isAuthenticated: () => localStorage.getItem(KEYS.AUTH) === 'true',

  // Profile
  getProfileSync: (): Profile => JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{"displayName":"Admin","email":"admin@test.com","avatarUrl":null}'),
  getProfile: async (): Promise<Profile> => {
    await delay();
    return api.getProfileSync();
  },
  updateProfile: async (data: Partial<Profile>) => {
    await delay();
    const current = api.getProfileSync();
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
  },
  getProduct: async (id: number): Promise<Product | null> => {
    await delay();
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    return products.find((p: Product) => p.id === id) || null;
  },
  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay();
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const newProduct = { ...product, id: Date.now() }; // pseudo-ID
    products.unshift(newProduct);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },
  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    await delay();
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const idx = products.findIndex((p: Product) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    products[idx] = { ...products[idx], ...data };
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products[idx];
  },
  deleteProduct: async (id: number): Promise<void> => {
    await delay();
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  },
  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    await delay();
    const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const idx = orders.findIndex((o: Order) => o.id === id);
    if (idx === -1) throw new Error("Order not found");
    orders[idx].status = status;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return orders[idx];
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]');
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
  },
  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    await delay();
    const current = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Analytics Helpers
  getAnalytics: async () => {
    await delay();
    const orders: Order[] = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const products: Product[] = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = orders.filter(o => o.date.startsWith(today)).reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter(p => p.stock < 10).length;

    return {
      kpis: {
        todaySales: todaySales || 14500, // fallback for demo if none match today
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStock
      },
      orders, // Returning for charts
      products
    };
  }
};
