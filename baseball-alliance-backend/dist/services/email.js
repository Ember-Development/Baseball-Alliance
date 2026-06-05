import { Resend } from "resend";
import { ENV } from "../env.js";
function magicLinkContent(url) {
    const subject = "Sign in to Baseball Alliance BAMS";
    const text = [
        "Use the link below to sign in to BAMS (Baseball Alliance Matching System).",
        "",
        url,
        "",
        `This link expires in ${ENV.MAGIC_LINK_TTL_MINUTES} minutes and can only be used once.`,
        "",
        "If you did not request this email, you can ignore it.",
    ].join("\n");
    const html = [
        "<p>Use the link below to sign in to BAMS (Baseball Alliance Matching System).</p>",
        `<p><a href="${url}">${url}</a></p>`,
        `<p>This link expires in ${ENV.MAGIC_LINK_TTL_MINUTES} minutes and can only be used once.</p>`,
        "<p>If you did not request this email, you can ignore it.</p>",
    ].join("");
    return { subject, text, html };
}
/**
 * Sends magic-link email via Resend when configured; otherwise logs in non-production.
 */
export async function sendMagicLinkEmail(to, url) {
    const { subject, text, html } = magicLinkContent(url);
    if (!ENV.RESEND_API_KEY) {
        if (ENV.NODE_ENV === "production") {
            console.warn(`[email] RESEND_API_KEY not configured — magic link for ${to} was NOT sent.`);
            return;
        }
        console.log(`[dev] Magic link for ${to}:\n${url}`);
        return;
    }
    const resend = new Resend(ENV.RESEND_API_KEY);
    const { error } = await resend.emails.send({
        from: ENV.EMAIL_FROM,
        to: [to],
        subject,
        text,
        html,
    });
    if (error) {
        console.error(`[email] Resend failed for ${to}:`, error);
        throw new Error(error.message ?? "Failed to send magic-link email");
    }
}
