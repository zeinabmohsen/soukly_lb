/** @type {import('next').NextConfig} */

// Where to forward /api/* requests. In prod (Vercel) set API_PROXY_TARGET to the
// backend's origin, e.g. https://soukly-lb.onrender.com. Defaults to the local
// backend for dev.
//
// Why proxy instead of calling the backend directly from the browser:
// the refresh-token cookie is set by the backend. If the browser talks to the
// backend on a *different site* (vercel.app -> onrender.com) that cookie is a
// third-party cookie, and Safari/Brave/Chrome-incognito drop it on reload —
// the user appears logged out. Routing /api through the SAME origin as the app
// makes the cookie first-party, so it survives reloads everywhere.
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:5000").replace(/\/$/, "")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
