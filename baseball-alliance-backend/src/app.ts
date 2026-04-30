import express from "express";
import cors from "cors";
import { ENV } from "./env";
import healthRouter from "./routes/health";
import eventsRouter from "./routes/events";
import teamsRouter from "./routes/teams";
import authRoutes from "./routes/auth";
import programsRouter from "./routes/programs";
import matchRouter from "./routes/match";
import registrationRoutes from "./routes/registration";
import paymentRoutes from "./routes/payment";

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, scope: "api", at: new Date().toISOString() })
);
app.use("/health", healthRouter);
app.use("/api/programs", programsRouter);
app.use("/api/match", matchRouter);
app.use("/api/events", eventsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);

// basic error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

export default app;
