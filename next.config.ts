import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  // Note: GitHub Actions workflow will automatically configure basePath
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
