import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  title: text("title").notNull(),
  slug: text("slug").notNull(),

  brand: text("brand").notNull(),
  category: text("category").notNull(),

  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),

  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull(),

  tags: jsonb("tags").$type<string[]>(),

  description: text("description"),

  specs: jsonb("specs").$type<{ label: string; value: string }[]>(),

  images: jsonb("images").$type<string[]>(),
  hoverImage: text("hover_image"),

  rating: integer("rating").notNull().default(5),
  reviews: integer("reviews").notNull().default(0),

  isPromotion: boolean("is_promotion").notNull().default(false),
  isPack: boolean("is_pack").notNull().default(false),
  packGroup: text("pack_group"),

  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerCity: text("customer_city").notNull(),
  customerAddress: text("customer_address").notNull(),
  date: timestamp("date").defaultNow(),
  status: text("status").notNull(),
  total: integer("total").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  discount: integer("discount").notNull().default(0),
  paymentMethod: text("payment_method").notNull(),
  items: jsonb("items").$type<
    { image: string; title: string; qty: number; price: number }[]
  >(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  totalOrders: integer("total_orders").notNull().default(0),
  lastOrderDate: timestamp("last_order_date"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address1: text("address_1").notNull(),
  address2: text("address_2"),
  shippingFee: integer("shipping_fee").notNull(),
  codDeposit: integer("cod_deposit").notNull(),
  theme: text("theme").notNull().default("light"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  date: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProductRequest = Partial<InsertProduct>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrderRequest = Partial<InsertOrder>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettingsRequest = Partial<InsertSettings>;