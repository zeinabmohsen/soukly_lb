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

module.exports = { sendEmail };
