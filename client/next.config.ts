import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A pnpm-lock.yaml in a parent directory makes Next infer the wrong
  // workspace root. Pin it to this app so build/dev resolve here.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
