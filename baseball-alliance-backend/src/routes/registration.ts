// src/routes/registrations.ts
import { Router } from "express";
import { prisma } from "../db";
import { CombineRegistrationInput } from "../types";
import { requireAuth } from "../middleware/requireAuth";

const r = Router();

r.post("/combine/:eventId", requireAuth, async (req: any, res, next) => {
  try {
    const eventId = req.params.eventId as string;
    const userId = req.user.id as string;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.type !== "COMBINE")
      return res.status(400).json({ error: "Event is not a COMBINE" });

    const data = CombineRegistrationInput.parse(req.body);

    // one per user per combine (enforced by unique index too)
    const created = await prisma.combineRegistration.create({
      data: {
        eventId,
        userId,
        status: "PENDING",

        playerFullName: data.playerFullName,
        dob: data.dob,
        city: data.city,
        state: data.state,
        zip: data.zip,
        playerPhone: data.playerPhone,
        playerEmail: data.playerEmail,

        parentFullName: data.parentFullName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail,
        parentConsentUnder13: !!data.parentConsentUnder13,

        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,

        primaryPosition: data.primaryPosition,
        secondaryPosition: data.secondaryPosition,
        bats: data.bats,
        throws: data.throws,
        height: data.height,
        weight: data.weight,

        gradYear: data.gradYear,
        schoolGrade: data.schoolGrade,
        schoolName: data.schoolName,
        schoolLocation: data.schoolLocation,
        clubTeam: data.clubTeam,
        coachName: data.coachName,
        coachContact: data.coachContact,

        shirtSize: data.shirtSize,
        agreeToWaiver: data.agreeToWaiver,
        privacyAck: data.privacyAck,
      },
      include: { event: true },
    });

    return res.status(201).json({
      id: created.id,
      status: created.status,
      eventId: created.eventId,
      userId: created.userId,
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      // unique (eventId,userId)
      return res
        .status(409)
        .json({ error: "Already registered for this event" });
    }
    if (e?.issues) {
      return res.status(400).json({ errors: e.flatten?.() ?? e });
    }
    next(e);
  }
});

r.get("/combine/payment/:paymentId", requireAuth, async (req, res) => {
  const payment = await prisma.combinePayment.findUnique({
    where: { id: req.params.paymentId },
    include: { registration: true },
  });
  if (!payment) return res.status(404).json({ error: "Not found" });
  res.json(payment);
});

export default r;
