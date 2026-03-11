import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: rootDir,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
