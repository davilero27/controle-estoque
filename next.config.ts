import type { NextConfig } from "next";

import path from "node:path";

const nextConfig: NextConfig = {
  // Evita confusão quando existe outro lockfile fora do projeto (ex.: C:\Users\david\package-lock.json)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
