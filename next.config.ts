import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'take-congress-pics-imagebucket-k8vj2yrrwfw0.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
