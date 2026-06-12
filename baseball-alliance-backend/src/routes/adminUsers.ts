import { Router } from "express";
import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { importPlaybookSyncEvents } from "../services/playbookEventImport.js";
import {
  importPlaybookMembers,
  parsePlaybookCsv,
} from "../services/playbookCsv.js";

const r = Router();

r.use(express.json({ limit: "12mb" }));

const ImportBodySchema = z.object({
  csv: z.string().min(1),
  eventCsv: z.string().min(1).optional(),
  eventFileName: z.string().optional(),
});

/** POST /admin/users/import-playbook — CSV text from Playbook export */
r.post(
  "/import-playbook",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const parsed = ImportBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { rows, errors: parseErrors } = parsePlaybookCsv(parsed.data.csv);
    if (rows.length === 0 && parseErrors.length > 0) {
      return res.status(400).json({
        error: "Could not parse CSV",
        errors: parseErrors,
      });
    }

    const importResult = await importPlaybookMembers(rows);

    let eventImport;
    if (parsed.data.eventCsv) {
      eventImport = await importPlaybookSyncEvents(
        req.user!.id,
        parsed.data.eventCsv,
        rows,
        parsed.data.eventFileName
      );
    }

    return res.json({
      ...importResult,
      parseErrors,
      eventImport,
    });
  }
);

export default r;
