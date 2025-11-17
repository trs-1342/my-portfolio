// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   images: {
// //     remotePatterns: [
// //       { protocol: "https", hostname: "lh3.googleusercontent.com" },
// //       { protocol: "https", hostname: "avatars.githubusercontent.com" },
// //     ],
// //   },
// // };

// // export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   serverExternalPackages: ['@prisma/client', 'prisma'], // ← yeni anahtar
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
//       { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
//     ],
//   },
// };

// export default nextConfig;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack hangi klasörü "proje kökü" kabul edecek?
  // Biz net şekilde repository kökünü veriyoruz.
  turbopack: {
    root: __dirname,
  },

  // İleride ekstra ayarların olursa buraya eklersin
  // örn: reactStrictMode, experimental vs.
};

export default nextConfig;
