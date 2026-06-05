/**
 * Send a one-off BAMS magic-link test email via Resend.
 *
 * Usage:
 *   npm run email:test -- you@example.com
 *   EMAIL_TEST_TO=you@example.com npm run email:test
 */
import { ENV } from "../env.js";
import { sendMagicLinkEmail } from "../services/email.js";

async function main() {
  const to = process.argv[2]?.trim() || process.env.EMAIL_TEST_TO?.trim();

  if (!to) {
    console.error("Usage: npm run email:test -- <recipient@email.com>");
    console.error("   or: EMAIL_TEST_TO=recipient@email.com npm run email:test");
    process.exit(1);
  }

  if (!ENV.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Add it to .env and try again.");
    process.exit(1);
  }

  const base = ENV.FRONTEND_URL.replace(/\/$/, "");
  const testUrl = `${base}/bams/auth/callback?token=test-email-script-not-valid`;

  console.log(`Sending test magic-link email to ${to}`);
  console.log(`From: ${ENV.EMAIL_FROM}`);

  await sendMagicLinkEmail(to, testUrl);

  console.log("Email sent successfully. Check inbox and Resend dashboard logs.");
}

main().catch((err) => {
  console.error("Failed to send test email:", err);
  process.exit(1);
});
