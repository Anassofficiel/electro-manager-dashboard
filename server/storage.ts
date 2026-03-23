import "dotenv/config";
import { supabase } from "./supabase";
import {
  type Product,
  type InsertProduct,
  type UpdateProductRequest,
  type Order,
  type InsertOrder,
  type UpdateOrderRequest,
  type Customer,
  type InsertCustomer,
  type Settings,
  type UpdateSettingsRequest,
} from "@shared/schema";

export interface IStorage {
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: number,
    updates: UpdateProductRequest
  ): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(
    id: number,
    updates: UpdateOrderRequest
  ): Promise<Order | undefined>;

  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
}

// ─── helpers: products ────────────────────────────────────────────────────────
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    sku: row.sku,
    tags: row.tags ?? [],
    description: row.description ?? null,
    specs: row.specs ?? [],
    images: row.images ?? [],
    hoverImage: row.hover_image ?? null,
    rating: row.rating ?? 5,
    reviews: row.reviews ?? 0,
    isPromotion: row.is_promotion ?? false,
    isPack: row.is_pack ?? false,
    packGroup: row.pack_group ?? null,
    isActive: row.is_active ?? true,
  };
}

function mapInsertProductToRow(product: InsertProduct) {
  return {
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    stock: product.stock,
    sku: product.sku,
    tags: product.tags ?? [],
    description: product.description ?? null,
    specs: product.specs ?? [],
    images: product.images ?? [],
    hover_image: product.hoverImage ?? null,
    rating: product.rating ?? 5,
    reviews: product.reviews ?? 0,
    is_promotion: product.isPromotion ?? false,
    is_pack: product.isPack ?? false,
    pack_group: product.packGroup ?? null,
    is_active: product.isActive ?? true,
  };
}

function mapUpdateProductToRow(product: UpdateProductRequest) {
  const updates: Record<string, any> = {};

  if (product.title !== undefined) updates.title = product.title;
  if (product.slug !== undefined) updates.slug = product.slug;
  if (product.brand !== undefined) updates.brand = product.brand;
  if (product.category !== undefined) updates.category = product.category;
  if (product.price !== undefined) updates.price = product.price;
  if (product.compareAtPrice !== undefined) {
    updates.compare_at_price = product.compareAtPrice;
  }
  if (product.stock !== undefined) updates.stock = product.stock;
  if (product.sku !== undefined) updates.sku = product.sku;
  if (product.tags !== undefined) updates.tags = product.tags;
  if (product.description !== undefined) updates.description = product.description;
  if (product.specs !== undefined) updates.specs = product.specs;
  if (product.images !== undefined) updates.images = product.images;
  if (product.hoverImage !== undefined) updates.hover_image = product.hoverImage;
  if (product.rating !== undefined) updates.rating = product.rating;
  if (product.reviews !== undefined) updates.reviews = product.reviews;
  if (product.isPromotion !== undefined) updates.is_promotion = product.isPromotion;
  if (product.isPack !== undefined) updates.is_pack = product.isPack;
  if (product.packGroup !== undefined) updates.pack_group = product.packGroup;
  if (product.isActive !== undefined) updates.is_active = product.isActive;

  return updates;
}

// ─── helpers: orders ──────────────────────────────────────────────────────────
function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerCity: row.customer_city,
    customerAddress: row.customer_address,
    date: row.date ? new Date(row.date) : new Date(),
    status: row.status,
    total: row.total,
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount ?? 0,
    paymentMethod: row.payment_method,
    items: row.items ?? [],
  };
}

function mapInsertOrderToRow(order: InsertOrder) {
  return {
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_city: order.customerCity,
    customer_address: order.customerAddress,
    status: order.status,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount ?? 0,
    payment_method: order.paymentMethod,
    items: order.items ?? [],
  };
}

function mapUpdateOrderToRow(order: UpdateOrderRequest) {
  const updates: Record<string, any> = {};

  if (order.customerName !== undefined) updates.customer_name = order.customerName;
  if (order.customerPhone !== undefined) updates.customer_phone = order.customerPhone;
  if (order.customerCity !== undefined) updates.customer_city = order.customerCity;
  if (order.customerAddress !== undefined) updates.customer_address = order.customerAddress;
  if (order.status !== undefined) updates.status = order.status;
  if (order.total !== undefined) updates.total = order.total;
  if (order.subtotal !== undefined) updates.subtotal = order.subtotal;
  if (order.shipping !== undefined) updates.shipping = order.shipping;
  if (order.discount !== undefined) updates.discount = order.discount;
  if (order.paymentMethod !== undefined) updates.payment_method = order.paymentMethod;
  if (order.items !== undefined) updates.items = order.items;

  return updates;
}

// ─── helpers: customers derived from orders ───────────────────────────────────
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
        new Date(order.date).getTime() > new Date(current.lastOrderDate).getTime()
      ) {
        current.lastOrderDate = order.date;
      }

      if (!current.city && order.customerCity) {
        current.city = order.customerCity;
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastOrderDate ?? 0).getTime() -
      new Date(a.lastOrderDate ?? 0).getTime()
  );
}

export class MemStorage implements IStorage {
  private settings: Settings | undefined = undefined;
  private currentCustomerId = 1;

  // Products (Supabase)
  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapProductRow(data);
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapProductRow);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const payload = mapInsertProductToRow(insertProduct);

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return mapProductRow(data);
  }

  async updateProduct(
    id: number,
    updates: UpdateProductRequest
  ): Promise<Product | undefined> {
    const payload = mapUpdateProductToRow(updates);

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapProductRow(data);
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
  }

  // Orders (Supabase)
  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapOrderRow(data);
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapOrderRow);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const payload = mapInsertOrderToRow(insertOrder);

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return mapOrderRow(data);
  }

  async updateOrder(
    id: number,
    updates: UpdateOrderRequest
  ): Promise<Order | undefined> {
    const payload = mapUpdateOrderToRow(updates);

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw error;
    }

    return mapOrderRow(data);
  }

  // Customers (derived from Supabase orders)
  async getCustomer(id: number): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find((customer) => customer.id === id);
  }

  async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
    return deriveCustomersFromOrders(orders);
  }

  async createCustomer(_insertCustomer: InsertCustomer): Promise<Customer> {
    throw new Error(
      "Creating customers directly is not supported. Customers are derived from orders."
    );
  }

  // Settings (memory for now)
  async getSettings(): Promise<Settings | undefined> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        storeName: "ELECTRO MANAGER",
        phone: "123-456-7890",
        email: "demo@electro.com",
        address1: "123 Main St",
        address2: null,
        shippingFee: 50,
        codDeposit: 100,
        theme: "light",
      };
    }
    return this.settings;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const current = await this.getSettings();
    this.settings = { ...current!, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();