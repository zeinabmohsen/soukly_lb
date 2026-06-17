// Password breach check via the HaveIBeenPwned range API (k-anonymity).
//
// We SHA-1 the password, send only the first 5 hex chars of the hash to HIBP,
// and scan the returned suffixes locally — the full password (and full hash)
// never leave this process. If the password's hash appears in the breach
// corpus, it's rejected; this is exactly what stops Chrome's "Change your
// password" popup on real signups.
//
// Fail-open: any network error / timeout resolves to "not breached" so a HIBP
// outage can never block account creation.

const crypto = require("crypto");

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/";
const REQUEST_TIMEOUT_MS = 2500;

/**
 * @returns {Promise<{ breached: boolean, count: number }>}
 */
async function checkPasswordBreached(password) {
  if (typeof password !== "string" || password.length === 0) {
    return { breached: false, count: 0 };
  }

  const sha1 = crypto.createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: controller.signal,
    });
    if (!res.ok) return { breached: false, count: 0 };

    const body = await res.text();
    for (const line of body.split("\n")) {
      const [hashSuffix, countStr] = line.trim().split(":");
      if (hashSuffix === suffix) {
        const count = Number(countStr) || 0;
        // Padded entries are returned with a count of 0 — ignore those.
        return { breached: count > 0, count };
      }
    }
    return { breached: false, count: 0 };
  } catch {
    // Network error / timeout / abort — fail open.
    return { breached: false, count: 0 };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { checkPasswordBreached };
