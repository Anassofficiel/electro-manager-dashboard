import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexPath = path.join(distPath, "index.html");
  const assetsPath = path.join(distPath, "assets");

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve hashed assets directly
  app.use(
    "/assets",
    express.static(assetsPath, {
      immutable: true,
      maxAge: "1y",
      etag: false,
      fallthrough: false,
    }),
  );

  // Serve other static files
  app.use(
    express.static(distPath, {
      index: false,
      etag: false,
      maxAge: 0,
      fallthrough: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          res.setHeader("Surrogate-Control", "no-store");
        }
      },
    }),
  );

  // SPA fallback without wildcard path syntax
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/assets/")) return next();

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}