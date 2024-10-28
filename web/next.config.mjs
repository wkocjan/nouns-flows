/** @type {import('next').NextConfig} */
import { withHighlightConfig } from "@highlight-run/next/config"

const nextConfig = {
  webpack(config, options) {
    if (options.isServer) {
      config.ignoreWarnings = [{ module: /highlight-(run\/)?node/ }]
    }

    return config
  },
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.mypinata.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "noun.pics",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default withHighlightConfig(nextConfig)
