import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

type StoreProductInput = {
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

const storeProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  image: z.string(),
  hoverImage: z.string().optional(),
  stockStatus: z.enum(["in-stock", "low-stock", "out-of-stock"]).optional(),
  inStock: z.boolean().optional(),
  description: z.string().optional(),
  specs: z.record(z.string()).optional(),
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapStoreProductToDashboardProduct(product: StoreProductInput) {
  const stock =
    product.stockStatus === "out-of-stock"
      ? 0
      : product.stockStatus === "low-stock"
      ? 5
      : product.inStock === false
      ? 0
      : 25;

  const brand =
    product.specs?.Brand ||
    product.specs?.brand ||
    product.name.split(" ")[0] ||
    "ELECTRO";

  const sku = `STORE-${product.id.toUpperCase()}`;
  const isPromotion =
    Boolean(product.discount && product.discount > 0) ||
    Boolean(product.originalPrice && product.originalPrice > product.price);

  return {
    title: product.name,
    slug: slugify(product.name),
    brand,
    category: product.category,
    price: product.price,
    compareAtPrice: product.originalPrice ?? null,
    stock,
    sku,
    tags: isPromotion ? ["promotion", "store-import"] : ["store-import"],
    description: product.description ?? null,
    specs: product.specs
      ? Object.entries(product.specs).map(([label, value]) => ({
          label,
          value,
        }))
      : [],
    images: [product.image].filter((value): value is string => Boolean(value)),
    hoverImage: product.hoverImage ?? null,
    rating: Math.round(product.rating ?? 5),
    reviews: product.reviews ?? 0,
    isPromotion,
    isPack: false,
    packGroup: null,
    isActive: true,
  };
}

function enrichProductInput<T extends Record<string, any>>(input: T) {
  return {
    ...input,
    slug:
      input.slug && String(input.slug).trim().length > 0
        ? input.slug
        : slugify(input.title ?? ""),
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Products
  app.get(api.products.list.path, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const enrichedBody = enrichProductInput(req.body);
      const input = api.products.create.input.parse(enrichedBody);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const enrichedBody =
        req.body?.title !== undefined || req.body?.slug !== undefined
          ? enrichProductInput(req.body)
          : req.body;

      const input = api.products.update.input.parse(enrichedBody);

      const product = await storage.updateProduct(Number(req.params.id), input);

      if (!product) return res.status(404).json({ message: "Not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  // Import store products into dashboard database
  app.post("/api/products/import-store", async (req, res) => {
    try {
      let input: StoreProductInput[] = [];

      if (Array.isArray(req.body) && req.body.length > 0) {
        input = z.array(storeProductSchema).parse(req.body);
      } else {
        return res.status(400).json({
          message:
            "No store products were provided. Send an array of store products in the request body.",
        });
      }

      const existingProducts = await storage.getProducts();
      const existingSkus = new Set(existingProducts.map((p) => p.sku));

      const created: any[] = [];
      const skipped: any[] = [];

      for (const item of input) {
        const mapped = mapStoreProductToDashboardProduct(item);

        if (existingSkus.has(mapped.sku)) {
          skipped.push({
            id: item.id,
            name: item.name,
            reason: "already_exists",
          });
          continue;
        }

        const createdProduct = await storage.createProduct(mapped);
        created.push(createdProduct);
        existingSkus.add(mapped.sku);
      }

      res.status(201).json({
        message: "Store products import completed",
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // Orders
  app.get(api.orders.list.path, async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  });

  app.put(api.orders.update.path, async (req, res) => {
    try {
      const input = api.orders.update.input.parse(req.body);
      const order = await storage.updateOrder(Number(req.params.id), input);
      if (!order) return res.status(404).json({ message: "Not found" });
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // Customers
  app.get(api.customers.list.path, async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  });

  // Settings
  app.get(api.settings.get.path, async (_req, res) => {
    const s = await storage.getSettings();
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  });

  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const s = await storage.updateSettings(input);
      res.json(s);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  return httpServer;
}