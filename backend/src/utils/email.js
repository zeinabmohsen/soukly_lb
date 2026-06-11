// Pluggable email sender.
//
// In dev (no SMTP_HOST set), every "email" is just printed to the server console
// — including the password-reset URL — so you can copy it into the browser.
//
// In prod, set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM and
// install `nodemailer`. The first call lazily requires it; if the package isn't
// installed we fall back to console logging rather than crashing the route.

let cachedTransport = null;
let nodemailerLoadFailed = false;

function getTransport() {
  if (cachedTransport || nodemailerLoadFailed) return cachedTransport;
  if (!process.env.SMTP_HOST) return null;
  try {
    // eslint-disable-next-line global-require
    const nodemailer = require("nodemailer");
    cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    return cachedTransport;
  } catch (err) {
    nodemailerLoadFailed = true;
    console.warn("[email] SMTP configured but `nodemailer` is not installed; falling back to console logging.", err.message);
    return null;
  }
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransport();
  const fromAddress = process.env.SMTP_FROM || "Soukly <no-reply@soukly.app>";

  if (!transport) {
    // Dev fallback — print to stdout so the developer can act on it.
    console.log("\n────────── [email] ──────────");
    console.log(`To:      ${to}`);
    console.log(`From:    ${fromAddress}`);
    console.log(`Subject: ${subject}`);
    console.log("\n" + (text || html || "(no body)"));
    console.log("──────────────────────────────\n");
    return { delivered: false, transport: "console" };
  }

  await transport.sendMail({ from: fromAddress, to, subject, text, html });
  return { delivered: true, transport: "smtp" };
}

// Where the seller dashboard lives — used in notification CTAs. Override with
// APP_URL in prod (e.g. https://soukly.app).
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Minimal branded wrapper so the transactional emails look consistent without
// pulling in a templating dependency.
function wrap(title, bodyHtml) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
  ${bodyHtml}
  <p style="margin-top:32px;font-size:12px;color:#888">— The Soukly team</p>
</div>`;
}

// Seller decision email — sent when an admin approves or rejects a seller's
// application / store. Best-effort: callers wrap this in try/catch so a mail
// failure never blocks the approval itself.
async function sendSellerDecisionEmail({ to, name, storeName, approved }) {
  const who = name || "there";
  const store = storeName ? `"${storeName}"` : "your store";

  if (approved) {
    return sendEmail({
      to,
      subject: "Your Soukly store has been approved 🎉",
      text:
        `Hi ${who},\n\n` +
        `Great news — ${store} has been approved and you now have access to your seller dashboard.\n\n` +
        `Start your 30-day free trial, add products, and customize your storefront here:\n${APP_URL}/seller\n\n` +
        `Welcome to Soukly!`,
      html: wrap(
        "Your store has been approved 🎉",
        `<p>Hi ${who},</p>
         <p>Great news — <strong>${store}</strong> has been approved and you now have access to your seller dashboard.</p>
         <p><a href="${APP_URL}/seller" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open seller dashboard</a></p>
         <p>Start your 30-day free trial, add products, and customize your storefront.</p>`
      ),
    });
  }

  return sendEmail({
    to,
    subject: "Update on your Soukly seller application",
    text:
      `Hi ${who},\n\n` +
      `Thank you for your interest in selling on Soukly. After reviewing ${store}, we're unable to approve your application at this time.\n\n` +
      `If you believe this was a mistake or would like guidance on reapplying, just reply to this email.\n\n` +
      `Thank you for your understanding.`,
    html: wrap(
      "Update on your seller application",
      `<p>Hi ${who},</p>
       <p>Thank you for your interest in selling on Soukly. After reviewing <strong>${store}</strong>, we're unable to approve your application at this time.</p>
       <p>If you believe this was a mistake or would like guidance on reapplying, just reply to this email.</p>`
    ),
  });
}

module.exports = { sendEmail, sendSellerDecisionEmail };
