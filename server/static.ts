import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        const normalizedPath = filePath.replace(/\\/g, "/");

        // index.html must never be cached
        if (normalizedPath.endsWith("/index.html")) {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return;
        }

        // Vite hashed assets can be cached safely
        if (normalizedPath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        // other static files: small cache only
        res.setHeader("Cache-Control", "public, max-age=3600");
      },
    }),
  );

  // SPA fallback
  app.get("/{*path}", (_req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}