import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexPath = path.join(distPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve all static files normally
  app.use(
    express.static(distPath, {
      etag: false,
      maxAge: "1h",
      index: false,
    }),
  );

  // SPA fallback only for app routes, not API and not real files
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api")) return next();

    // If request looks like a real file (.js, .css, .png, etc.) and was not found, return 404
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