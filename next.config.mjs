/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.mypinata.cloud",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
