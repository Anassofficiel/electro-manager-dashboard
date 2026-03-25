import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexPath = path.join(distPath, "index.html");
  const assetsPath = path.join(distPath, "assets");

  console.log("[static] cwd =", process.cwd());
  console.log("[static] distPath =", distPath);
  console.log("[static] indexPath =", indexPath);
  console.log("[static] assetsPath =", assetsPath);
  console.log("[static] index exists =", fs.existsSync(indexPath));
  console.log("[static] assets exists =", fs.existsSync(assetsPath));

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve assets explicitly
  app.get("/assets/:file", (req: Request, res: Response, next: NextFunction) => {
    const filePath = path.join(assetsPath, req.params.file);
    const exists = fs.existsSync(filePath);

    console.log(`[assets] request=${req.path} file=${filePath} exists=${exists}`);

    if (!exists) {
      return res.status(404).end();
    }

    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.sendFile(filePath, (err) => {
      if (err) next(err);
    });
  });

  // Other static files like favicon, etc.
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

  // SPA fallback
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/assets/")) return next();

    if (path.extname(req.path)) {
      return res.status(404).end();
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}