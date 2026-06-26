import express, { Request, Response, NextFunction } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Custom Cybersecurity Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://eedenreicxebsfnoblza.supabase.co"
  );
  next();
});

// Memory rate-limiter for Auth Login endpoint (5 attempts max per minute per IP)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
app.use("/api/trpc/auth.login", (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ipStr = Array.isArray(ip) ? ip[0] : ip || "unknown";
  const now = Date.now();
  const attempt = loginAttempts.get(ipStr);
  
  if (attempt) {
    if (now > attempt.resetTime) {
      loginAttempts.set(ipStr, { count: 1, resetTime: now + 60 * 1000 });
    } else {
      attempt.count++;
      if (attempt.count > 5) {
        return res.status(429).json({
          error: {
            message: "Muitas tentativas de login. Tente novamente em 1 minuto."
          }
        });
      }
    }
  } else {
    loginAttempts.set(ipStr, { count: 1, resetTime: now + 60 * 1000 });
  }
  next();
});

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
