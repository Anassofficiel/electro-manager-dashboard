import {
  type Product, type InsertProduct, type UpdateProductRequest,
  type Order, type InsertOrder, type UpdateOrderRequest,
  type Customer, type InsertCustomer,
  type Settings, type InsertSettings, type UpdateSettingsRequest
} from "@shared/schema";

export interface IStorage {
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: UpdateOrderRequest): Promise<Order | undefined>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order> = new Map();
  private customers: Map<number, Customer> = new Map();
  private settings: Settings | undefined = undefined;
  private currentProductId = 1;
  private currentOrderId = 1;
  private currentCustomerId = 1;

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = { ...insertProduct, id: this.currentProductId++ };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = { ...insertOrder, id: this.currentOrderId++, date: new Date() };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(id: number, updates: UpdateOrderRequest): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.orders.set(id, updated);
    return updated;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = { ...insertCustomer, id: this.currentCustomerId++ };
    this.customers.set(customer.id, customer);
    return customer;
  }

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
