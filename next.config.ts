import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Отключаем оптимизацию для внешних изображений (обходит проверку private IP)
    unoptimized: true,
  },
};

export default nextConfig;
