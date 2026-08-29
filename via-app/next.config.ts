// NECESSITY: Next.js restricts which external images can be loaded via the <Image> component.
// Google OAuth returns user profile pictures hosted on lh3.googleusercontent.com, so we must
// whitelist this domain. Without this config, Google avatars would show broken image icons.
// LOGIC: The `remotePatterns` array tells Next.js's image optimization proxy to allow images
// from the specified hostname. The protocol, hostname, and pathname pattern must match exactly.
// EDGE-CASE: If a user's Google profile has no picture, the fallback UI renders their initial.
// But when a picture IS available, it must load without Next.js blocking it.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
