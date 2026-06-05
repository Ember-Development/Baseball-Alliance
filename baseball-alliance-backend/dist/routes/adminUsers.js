import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { importPlaybookMembers, parsePlaybookCsv, } from "../services/playbookCsv.js";
const r = Router();
const ImportBodySchema = z.object({
    csv: z.string().min(1),
});
/** POST /admin/users/import-playbook — CSV text from Playbook export */
r.post("/import-playbook", requireAuth, requireRole("ADMIN"), async (req, res) => {
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
    return res.json({
        ...importResult,
        parseErrors,
    });
});
export default r;
