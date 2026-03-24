import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const assetsPath = path.join(distPath, "assets");
  const indexPath = path.join(distPath, "index.html");

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
    }),
  );

  // Serve other static files (favicon, etc.)
  app.use(
    express.static(distPath, {
      index: false,
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    }),
  );

  // SPA fallback
  app.get("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(indexPath);
  });
}