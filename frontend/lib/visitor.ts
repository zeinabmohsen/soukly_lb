// Anonymous per-browser visitor id, used only to count unique storefront
// visitors in seller analytics. It is not linked to an account and carries no
// personal data — just a random id persisted in localStorage so repeat visits
// from the same browser aren't counted as new visitors each time.

const STORAGE_KEY = "soukly_vid"

export function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    // localStorage disabled (private mode) — analytics still counts the view,
    // just without a stable visitor id.
    return ""
  }
}
