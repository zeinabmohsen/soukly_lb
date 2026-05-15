/**
 * Converts a string to a URL-safe slug.
 * Handles Arabic, accented Latin, and special characters.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")       // spaces and underscores → dash
    .replace(/[^\w\-]/g, "")       // strip non-word chars (incl. Arabic)
    .replace(/\-{2,}/g, "-")       // collapse multiple dashes
    .replace(/^-+|-+$/g, "");      // strip leading/trailing dashes
}

/**
 * Generates a unique slug by appending a suffix if the base slug is taken.
 * @param {string} base - raw text to slugify
 * @param {Function} exists - async (slug) => boolean
 */
async function uniqueSlug(base, exists) {
  const root = slugify(base);
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i++}`;
  }
  return candidate;
}

module.exports = { slugify, uniqueSlug };
