import { Router } from "express";
import { matchQuerySchema, matchRequestV1Schema } from "../schemas/collegeMatch.js";
import { runCollegeMatch } from "../services/collegeMatchEngine.js";
import { validationFailed, zodErrorToDetails } from "../utils/zodHttp.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const qParsed = matchQuerySchema.safeParse(req.query);
    if (!qParsed.success) {
      return res
        .status(400)
        .json(validationFailed(zodErrorToDetails(qParsed.error)));
    }

    const bodyParsed = matchRequestV1Schema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res
        .status(400)
        .json(validationFailed(zodErrorToDetails(bodyParsed.error)));
    }

    const payload = await runCollegeMatch(bodyParsed.data, qParsed.data);
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export default router;
