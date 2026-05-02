import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import eventsRouter from "./routes/events.js";
import teamsRouter from "./routes/teams.js";
import authRoutes from "./routes/auth.js";
import programsRouter from "./routes/programs.js";
import matchRouter from "./routes/match.js";
import registrationRoutes from "./routes/registration.js";
import paymentRoutes from "./routes/payment.js";
import siteRouter from "./routes/site.js";
const app = express();
app.use(cors());
app.use(express.json());
// routes
app.get("/api/health", (_req, res) => res.json({ ok: true, scope: "api", at: new Date().toISOString() }));
app.use("/health", healthRouter);
app.use("/api/programs", programsRouter);
app.use("/api/match", matchRouter);
app.use("/api/events", eventsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/site", siteRouter);
// basic error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});
export default app;
