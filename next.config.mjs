/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.worf.replit.dev',
    '*.pike.replit.dev',
    '61516db4-a868-41eb-8d57-bb4df9fd640d-00-gk3tdcngj1s7.pike.replit.dev',
  ],
}

export default nextConfig
