import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  // Redirigimos nuestra ruta enmascarada al motor nativo
  async rewrites() {
    return [
      {
        source: '/linkni-opt',
        destination: '/_next/image',
      },
    ];
  },
};

export default nextConfig;