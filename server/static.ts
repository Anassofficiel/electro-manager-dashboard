import express, { type Express } from "express";
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

  app.use(
    "/assets",
    express.static(assetsPath, {
      immutable: true,
      maxAge: "1y",
      fallthrough: false,
    }),
  );

  app.use(
    express.static(distPath, {
      index: false,
      maxAge: "1h",
      fallthrough: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      },
    }),
  );

  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/assets/")) {
      return res.status(404).end();
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}