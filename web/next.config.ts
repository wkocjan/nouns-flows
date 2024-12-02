import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    after: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.giphy.com", pathname: "/**" },
      { protocol: "https", hostname: "*.mypinata.cloud", pathname: "/**" },
      { protocol: "https", hostname: "ipfs.io", pathname: "/**" },
      { protocol: "https", hostname: "noun.pics", pathname: "/**" },
      { protocol: "https", hostname: "imagedelivery.net", pathname: "/**" },
      {
        protocol: "https",
        hostname: "dmo9tcngmx442k9p.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
