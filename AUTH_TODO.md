# Auth — Outstanding Work

Generated 2026-05-22, after the auth hardening pass (15m/365d tokens, reuse detection, cookie auto-HTTPS, access token out of localStorage, login redirect fix).

## Immediate (lock down what's done)

- [ ] **Deploy backend + frontend** — all changes from this session only exist locally. Vercel needs a frontend redeploy; backend host needs a redeploy for the new cookie config and refresh-reuse detection.
- [ ] **Verify silent refresh works in dev** — DevTools → Network → reload a protected page → confirm `POST /auth/refresh` returns 200 and the request carries a `Cookie: soukly_refresh_token=...` header. If it returns 400/401, the cookie isn't being sent (likely `path` or `secure` flag mismatch).
- [ ] **Find the root cause of the original `router.push` bug** — currently worked around with `window.location.assign` in [login-client.tsx](frontend/app/login/login-client.tsx). For clean SPA navigation later, dig into why Next.js 16's client router wasn't navigating after login.

## Auth gaps to fill before public launch

- [ ] **Forgot/reset password flow** — no `/auth/forgot-password` or `/auth/reset-password` endpoint. Real users who forget their password have no recovery path.
- [ ] **Email verification actually wired up** — `is_verified` column exists in `users` table but no signup confirmation email is sent and no `/auth/verify-email` endpoint exists. Field is currently meaningless.
- [ ] **Force-logout on password change** — destroy all `Session` rows for a user when their password changes (whether by them or by admin). Mitigates session hijacking after credential rotation.
- [ ] **Password strength check at signup** — reject breach-known passwords using top-100k HIBP list or the HIBP range API. Prevents Chrome's "Change your password" popup on real signups.

## Lower priority but real

- [ ] **Google OAuth** — `passport` is already imported in [backend/src/index.js](backend/src/index.js) but no provider is configured. One-click signup → measurable conversion boost.
- [ ] **Sessions / device list UI** — extend `Session` table with `created_at`, `user_agent`, `ip`; add `GET /auth/sessions` + `DELETE /auth/sessions/:id` endpoints; profile page UI lists "logged in on iPhone, Chrome Mac" with revoke button.
- [ ] **Cookie `Partitioned` attribute (CHIPS)** — opt into Chrome's partitioned cookies so auth still works if Chrome enables 3rd-party cookie blocking for your users.
- [ ] **Rate-limit forgot-password + verify-email endpoints** — when they exist, add them to [rateLimiters.js](backend/src/api/v1/middlewares/rateLimiters.js).

## Code hygiene from this session

- [ ] **Update project memory** — the backend hardening section in `C:\Users\LENOVO\.claude\projects\d--soukly\memory\project_soukly_state.md` lists outdated cookie behavior; should reflect 365d refresh / 15m access / `isSecureRequest` / reuse detection.


also :
For production: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, then npm install nodemailer in the backend. The helper auto-detects and switches transports.

buyer order timeline