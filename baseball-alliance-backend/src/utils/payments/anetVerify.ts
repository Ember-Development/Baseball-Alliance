import crypto from "crypto";

const { AUTHORIZE_SIGNATURE_KEY } = process.env;

/** Verify X-ANET-SIGNATURE header against raw body */
export function verifyAnetSignature(
  headerVal: string | undefined,
  rawBody: string
) {
  if (!AUTHORIZE_SIGNATURE_KEY) return false;
  if (!headerVal) return false;
  // header is: "sha512=<hex>"
  const parts = headerVal.split("=");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "sha512") return false;

  const expected = crypto
    .createHmac("sha512", Buffer.from(AUTHORIZE_SIGNATURE_KEY, "hex"))
    .update(rawBody)
    .digest("hex");

  const given = parts[1].toLowerCase();
  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}
