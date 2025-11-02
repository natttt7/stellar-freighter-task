// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // FORZAR WEBPACK (NO TURBOPACK)
  webpack: null,
  experimental: {
    // Desactiva Turbopack completamente
    turbopack: false,
  },
};
