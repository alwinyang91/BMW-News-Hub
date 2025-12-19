import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  // Note: GitHub Actions workflow will automatically configure basePath
  // Set basePath for local builds to match GitHub Pages URL structure
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/BMW-News-Hub",
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
