import { Router } from "express";
const route = Router();

route.get("/", (_req, res) =>
  res.json({ ok: true, at: new Date().toISOString() })
);

export default route;
