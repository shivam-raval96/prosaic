/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for GitHub Pages
  output: "export",

  // Set base path for GitHub Pages (replace 'prosaic' with your repo name)
  basePath: process.env.NODE_ENV === "production" ? "/prosaic" : "",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for GitHub Pages
  trailingSlash: true,

  // Disable server-side features for static export
  // Note: esmExternals removed to avoid warnings
};

export default nextConfig;
