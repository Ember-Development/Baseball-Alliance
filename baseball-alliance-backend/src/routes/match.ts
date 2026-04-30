import { Router } from "express";
import { matchQuerySchema, matchRequestV1Schema } from "../schemas/collegeMatch";
import { runCollegeMatch } from "../services/collegeMatchEngine";
import { validationFailed, zodErrorToDetails } from "../utils/zodHttp";

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
