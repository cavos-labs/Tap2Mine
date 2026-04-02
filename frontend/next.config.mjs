import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Absolute package root for deps that must never resolve via a parent
 * directory's package.json (e.g. ~/package-lock.json making the repo root
 * look like the workspace).
 */
function resolvePackageDir(name) {
  try {
    return path.dirname(
      require.resolve(`${name}/package.json`, { paths: [__dirname] }),
    );
  } catch {
    return path.join(__dirname, "node_modules", name);
  }
}

const tailwindcssDir = resolvePackageDir("tailwindcss");
const tailwindPostcssDir = resolvePackageDir("@tailwindcss/postcss");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: tailwindcssDir,
      "@tailwindcss/postcss": tailwindPostcssDir,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: tailwindcssDir,
      "@tailwindcss/postcss": tailwindPostcssDir,
    };
    return config;
  },
};

export default nextConfig;
