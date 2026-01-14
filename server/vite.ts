import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Use process.cwd() to avoid __dirname/import.meta issues in CJS builds
const rootDir = process.cwd();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Resolve path relative to the process root
  const distPath = path.resolve(rootDir, "dist/public");

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // Fallback for SPA routing
    app.use("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    log(`Warning: Static files not found at ${distPath}`);
  }
}
