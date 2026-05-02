import { Router } from "express";
import { programsQuerySchema } from "../schemas/collegeMatch.js";
import { getProgramById, listPrograms, programFilters, } from "../services/collegeProgramService.js";
import { validationFailed, zodErrorToDetails } from "../utils/zodHttp.js";
const router = Router();
router.get("/filters", async (req, res, next) => {
    try {
        const division = typeof req.query.division === "string" && req.query.division.trim()
            ? req.query.division.trim()
            : undefined;
        const data = await programFilters({ division });
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.get("/", async (req, res, next) => {
    try {
        const parsed = programsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res
                .status(400)
                .json(validationFailed(zodErrorToDetails(parsed.error)));
        }
        const payload = await listPrograms(parsed.data);
        res.json(payload);
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const row = await getProgramById(req.params.id);
        if (!row)
            return res.status(404).json({ error: "Not found" });
        res.json(row);
    }
    catch (e) {
        next(e);
    }
});
export default router;
