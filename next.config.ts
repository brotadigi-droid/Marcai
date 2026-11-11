import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // A página inicial é o site de lançamento (HTML estático em public/lancamento.html).
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/lancamento.html" }] };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
