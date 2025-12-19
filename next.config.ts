import type { NextConfig } from "next";

// Determine basePath based on environment
// - Development: no basePath (access via http://localhost:3000)
// - Production build: use basePath for GitHub Pages
// - GitHub Actions: will auto-configure basePath
const getBasePath = () => {
  // Allow explicit override via environment variable
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  
  // In development mode, don't use basePath
  if (process.env.NODE_ENV === "development") {
    return "";
  }
  
  // For production builds, use the repository name as basePath
  // GitHub Actions will override this automatically
  return "/BMW-News-Hub";
};

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  // Note: GitHub Actions workflow will automatically configure basePath
  basePath: getBasePath(),
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
