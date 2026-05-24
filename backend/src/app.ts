import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import * as helmet from "helmet";
import morgan from "morgan";
import { allowedOrigins, env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authRouter } from "./routes/auth.js";
import { issuesRouter } from "./routes/issues.js";

export function createApp() {
  const app = express();

  app.use(helmet.default());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin is not allowed by CORS."));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/issues", issuesRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
