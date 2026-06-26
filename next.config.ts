import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/tipoca-research",
  images: { unoptimized: true },
};

export default nextConfig;
