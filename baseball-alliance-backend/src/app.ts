import express from "express";
import cors from "cors";
import { ENV } from "./env";
import healthRouter from "./routes/health";
import eventsRouter from "./routes/events";
import teamsRouter from "./routes/teams";
import authRoutes from "./routes/auth";
import registrationRoutes from "./routes/registration";
import paymentRoutes from "./routes/payment";

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/health", healthRouter);
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
