/** @type {import('next').NextConfig} */

// `npm run build:pages` produces a static export for GitHub Pages, served from
// https://alicepicco333.github.io/react-portfolio-template/
const isPages = process.env.npm_lifecycle_event === "build:pages" || process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/react-portfolio-template" : "";

const nextConfig = {
  reactStrictMode: true,
  ...(isPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
