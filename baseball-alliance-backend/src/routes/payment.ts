// src/routes/payments.ts
import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { CreateAcceptHostedSessionSchema } from "../types";
import { createAcceptHostedSessionForCombine } from "../utils/payments/payment";
import { verifyAnetSignature } from "../utils/payments/anetVerify";

const r = Router();

/**
 * Create an Accept Hosted session token for a CombineRegistration.
 * Body: { registrationId, amountCents? }
 */
r.post("/accept-hosted/session", requireAuth, async (req, res, next) => {
  try {
    const body = CreateAcceptHostedSessionSchema.parse(req.body);
    const { token, url, paymentId } = await createAcceptHostedSessionForCombine(
      {
        registrationId: body.registrationId,
        userId: req.user!.id,
        amountCents: body.amountCents,
      }
    );
    res.json({ token, url, paymentId });
  } catch (e) {
    next(e);
  }
});

/**
 * Webhook receiver from Authorize.net (Net.Authorize Payment Events)
 * You must configure webhook in Authorize.net dashboard to point here.
 */
r.post("/accept-hosted/webhook", expressRawJson, async (req, res) => {
  // raw body was captured by expressRawJson (below)
  const raw = (req as any).rawBody as string;
  const signature = req.header("X-ANET-SIGNATURE");

  if (!verifyAnetSignature(signature, raw)) {
    return res.status(401).send("Invalid signature");
  }

  // Payload schema (simplified)
  const event = req.body; // {eventType, payload:{ id: transId, authAmount, order:{invoiceNumber: <paymentId>} ... }}

  try {
    const type = String(event.eventType || "");
    const payload = event.payload || {};
    const transId: string | undefined = payload.id;
    const invoiceNumber: string | undefined = payload.order?.invoiceNumber;

    if (!invoiceNumber) {
      // Can't link to your Payment row without invoiceNumber
      return res.status(200).send("No invoiceNumber; ignored");
    }

    // Find the CombinePayment by invoiceNumber
    const payment = await prisma.combinePayment.findUnique({
      where: { id: invoiceNumber },
    });
    if (!payment) return res.status(200).send("Payment not found (ignored)");

    // Determine status mapping
    // Common events:
    // net.authorize.payment.authcapture.created   => succeeded
    // net.authorize.payment.auth.created          => auth only (treat requires action or pending capture)
    // net.authorize.payment.fraud.declined        => failed
    let nextStatus: "SUCCEEDED" | "FAILED" | "REFUNDED" | null = null;
    if (type === "net.authorize.payment.authcapture.created")
      nextStatus = "SUCCEEDED";
    else if (type === "net.authorize.payment.fraud.declined")
      nextStatus = "FAILED";
    else if (type === "net.authorize.payment.refund.created")
      nextStatus = "REFUNDED";

    // Update payment
    if (nextStatus) {
      await prisma.combinePayment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          providerRef: transId || payment.providerRef, // save transaction id
        },
      });

      // If succeeded → mark registration as PAID
      if (nextStatus === "SUCCEEDED") {
        await prisma.combineRegistration.update({
          where: { id: payment.combineRegistrationId },
          data: { status: "PAID" },
        });
      }

      // If refunded → mark registration as REFUNDED
      if (nextStatus === "REFUNDED") {
        await prisma.combineRegistration.update({
          where: { id: payment.combineRegistrationId },
          data: { status: "REFUNDED" },
        });
      }
    }
    return res.status(200).send("OK");
  } catch (e) {
    return res.status(500).send("Error");
  }
});

/** Capture raw JSON for signature verification */
function expressRawJson(req: any, res: any, next: any) {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk: string) => {
    data += chunk;
  });
  req.on("end", () => {
    req.rawBody = data;
    try {
      req.body = data ? JSON.parse(data) : {};
    } catch {
      req.body = {};
    }
    next();
  });
}

export default r;
