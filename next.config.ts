import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Este projeto tem seu próprio lockfile; não use o lockfile solto na pasta pai.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
