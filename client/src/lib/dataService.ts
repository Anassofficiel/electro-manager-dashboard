import { v4 as uuidv4 } from "uuid";

// Types
export type Product = {
  id: number;
  title: string;
  slug: string;
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
  hoverImage: string | null;
  rating: number;
  reviews: number;
  isPromotion: boolean;
  isPack: boolean;
  packGroup: string | null;
  isActive: boolean;
};

export type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  date: string;
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

// Store product type from storefront
export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  hoverImage?: string;
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
  inStock?: boolean;
  description?: string;
  specs?: Record<string, string>;
};

const API_BASE_URL = "";

// Local keys only for auth/profile/settings fallback
const KEYS = {
  SETTINGS: "em_settings",
  PROFILE: "em_profile",
  AUTH: "em_auth",
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 200));

const seedLocalData = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const settings: Settings = {
      id: 1,
      storeName: "ELECTRO MANAGER",
      phone: "+212 600 123 456",
      email: "contact@electromanager.com",
      address1: "Tech Boulevard, Casablanca",
      address2: null,
      shippingFee: 50,
      codDeposit: 100,
      theme: "light",
    };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  if (!localStorage.getItem(KEYS.PROFILE)) {
    const profile: Profile = {
      displayName: "Moustpha Admin",
      email: "moustpha@electromanager.com",
      avatarUrl: null,
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Réponse JSON invalide depuis ${url}`);
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function normalizeProduct(raw: any): Product {
  return {
    id: Number(raw.id),
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    brand: raw.brand ?? "",
    category: raw.category ?? "",
    price: Number(raw.price ?? 0),
    compareAtPrice:
      raw.compareAtPrice !== undefined
        ? raw.compareAtPrice === null
          ? null
          : Number(raw.compareAtPrice)
        : raw.compare_at_price === undefined || raw.compare_at_price === null
        ? null
        : Number(raw.compare_at_price),
    stock: Number(raw.stock ?? 0),
    sku: raw.sku ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    description: raw.description ?? null,
    specs: Array.isArray(raw.specs) ? raw.specs : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    hoverImage:
      raw.hoverImage !== undefined
        ? raw.hoverImage ?? null
        : raw.hover_image ?? null,
    rating:
      raw.rating === undefined || raw.rating === null
        ? 5
        : Number(raw.rating),
    reviews:
      raw.reviews === undefined || raw.reviews === null
        ? 0
        : Number(raw.reviews),
    isPromotion:
      raw.isPromotion !== undefined
        ? Boolean(raw.isPromotion)
        : Boolean(raw.is_promotion),
    isPack:
      raw.isPack !== undefined ? Boolean(raw.isPack) : Boolean(raw.is_pack),
    packGroup:
      raw.packGroup !== undefined ? raw.packGroup ?? null : raw.pack_group ?? null,
    isActive:
      raw.isActive !== undefined ? Boolean(raw.isActive) : raw.is_active !== false,
  };
}

function normalizeProducts(raw: any[]): Product[] {
  return (raw ?? []).map(normalizeProduct);
}

function normalizeOrders(raw: any[]): Order[] {
  return (raw ?? []).map((order) => ({
    ...order,
    date:
      typeof order.date === "string"
        ? order.date
        : new Date(order.date).toISOString(),
    items: order.items ?? [],
    discount: order.discount ?? 0,
  }));
}

function deriveCustomersFromOrders(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const order of orders) {
    const key = `${order.customerName}__${order.customerPhone}`;

    if (!map.has(key)) {
      map.set(key, {
        id: order.id,
        name: order.customerName,
        phone: order.customerPhone,
        city: order.customerCity,
        totalOrders: 1,
        lastOrderDate: order.date,
      });
    } else {
      const current = map.get(key)!;
      current.totalOrders += 1;

      if (
        !current.lastOrderDate ||
        new Date(order.date) > new Date(current.lastOrderDate)
      ) {
        current.lastOrderDate = order.date;
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastOrderDate || 0).getTime() -
      new Date(a.lastOrderDate || 0).getTime()
  );
}

export const api = {
  init: () => seedLocalData(),

  // Auth
  login: async (email: string) => {
    await delay();
    localStorage.setItem(KEYS.AUTH, "true");
    const p = api.getProfileSync();
    if (p) {
      p.email = email;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    }
    return { success: true };
  },

  logout: async () => {
    await delay();
    localStorage.removeItem(KEYS.AUTH);
  },

  isAuthenticated: () => localStorage.getItem(KEYS.AUTH) === "true",

  // Profile
  getProfileSync: (): Profile =>
    JSON.parse(
      localStorage.getItem(KEYS.PROFILE) ||
        '{"displayName":"Admin","email":"admin@test.com","avatarUrl":null}'
    ),

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

  // Products (REAL API)
  getProducts: async (): Promise<Product[]> => {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/products`);
    return normalizeProducts(data);
  },

  getProduct: async (id: number): Promise<Product | null> => {
    try {
      const data = await fetchJson<any>(`${API_BASE_URL}/api/products/${id}`);
      return normalizeProduct(data);
    } catch {
      return null;
    }
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    const created = await fetchJson<any>(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    return normalizeProduct(created);
  },

  updateProduct: async (
    id: number,
    data: Partial<Product>
  ): Promise<Product> => {
    const updated = await fetchJson<any>(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return normalizeProduct(updated);
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  },

  importStoreProducts: async (storeProducts: StoreProduct[]) => {
    return await fetchJson<{
      message: string;
      createdCount: number;
      skippedCount: number;
      created: Product[];
      skipped: { id: string; name: string; reason: string }[];
    }>(`${API_BASE_URL}/api/products/import-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeProducts),
    });
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const data = await fetchJson<any[]>(`${API_BASE_URL}/api/orders`);
    return normalizeOrders(data);
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const currentOrder = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`);

    const updated = await fetchJson<any>(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentOrder,
        status,
      }),
    });

    return {
      ...updated,
      date:
        typeof updated.date === "string"
          ? updated.date
          : new Date(updated.date).toISOString(),
      items: updated.items ?? [],
      discount: updated.discount ?? 0,
    };
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const orders = await api.getOrders();
    return deriveCustomersFromOrders(orders);
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || "{}");
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    await delay();
    const current = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || "{}");
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Analytics
  getAnalytics: async () => {
    const orders = await api.getOrders();
    const products = await api.getProducts();

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todaySales = orders
      .filter((o) => o.date.startsWith(today))
      .reduce((sum, o) => sum + o.total, 0);

    const monthSales = orders
      .filter((o) => {
        const d = new Date(o.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + o.total, 0);

    const yearSales = orders
      .filter((o) => {
        const d = new Date(o.date);
        return d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + o.total, 0);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const totalProducts = products.length;
    const totalOrders = orders.length;

    return {
      kpis: {
        todaySales: todaySales || 0,
        monthSales: monthSales || 0,
        yearSales: yearSales || 0,
        totalRevenue: totalRevenue || 0,
        totalOrders,
        totalProducts,
        lowStock,
      },
      orders,
      products,
    };
  },
};