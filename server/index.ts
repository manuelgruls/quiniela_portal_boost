import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http"; // Import explicitly
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { pool } from "./db"; // Import raw pool
import session from "express-session"; // Import session
import MySQLStore from "express-mysql-session"; // Import MySQL store factory

const app = express();
// CRITICAL FIX: Trust the cPanel/Reverse Proxy so Secure Cookies work
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Global Error Handlers for crash debugging
process.on('uncaughtException', (err) => {
  console.error('[CRASH] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 1. SETUP SESSIONS (Critical for Login)
const MySQLStoreSession = MySQLStore(session);
app.use(session({
  name: 'sid', // Changed session cookie name to 'sid'
  secret: process.env.SESSION_SECRET || 'dev_secret_key_123',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStoreSession({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000, // 1 day
    createDatabaseTable: true,
    schema: {
      tableName: 'http_sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  }, pool), // Use existing pool from db.ts
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Now works because of 'trust proxy'
    httpOnly: true,
    sameSite: 'lax', // Safer default
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  // --- STARTUP PROBE ---
  try {
    console.log("--- SYSTEM STARTUP: v2.5 (Email Debug Mode) ---");
    console.error("[Startup] Testing Database Connection...");
    const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM profiles");
    console.error(`[Startup] PROBE RESULT: Found ${rows[0].count} users in 'profiles' table.`);

    const [pages]: any = await pool.query("SELECT COUNT(*) as count FROM pages");
    console.error(`[Startup] PROBE RESULT: Found ${pages[0].count} pages in 'pages' table.`);

    // Log message to indicate KILO UPDATE was applied
    console.error("!!! KILO UPDATE APPLIED: v3 SESSIONS !!!");
  } catch (err: any) {
    console.error("[Startup] CRITICAL DB ERROR:", err.message);
    // Exit if database connection fails
    process.exit(1);
  }
  // ---------------------

  // 1. Setup Routes
  await registerRoutes(app);

  // 2. Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    // Simplified error handler messages
    res.status(status).json({ error: 'Internal Server Error' });
    console.error('[ERROR]', err);
  });

  // 3. Setup Static Files
  serveStatic(app);

  // 4. Create Server & Listen (Standard Signature)
  const port = parseInt(process.env.PORT || "5000", 10);

  // Explicitly create the server here
  const server = createServer(app);

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.error(`[Server] Listening on port ${port}`);
  });
})();