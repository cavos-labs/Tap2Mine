import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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
const tailwindIndexCss = path.join(tailwindcssDir, "index.css");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: tailwindcssDir,
      "tailwindcss/index.css": tailwindIndexCss,
      "@tailwindcss/postcss": tailwindPostcssDir,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: tailwindcssDir,
      "tailwindcss/index.css": tailwindIndexCss,
      "@tailwindcss/postcss": tailwindPostcssDir,
    };
    return config;
  },
};

export default nextConfig;
