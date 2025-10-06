/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Only use export mode when building for mobile
  ...(process.env.MOBILE_BUILD === 'true' && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
  }),
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // Increase body size limit for App Router
    serverComponentsExternalPackages: [],
  },
  // Configure API routes for large file uploads
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
    responseLimit: false,
  },
}

export default nextConfig
