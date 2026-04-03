import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** String plugin name avoids bundling native Tailwind/PostCSS deps into Next. */
const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": { base: __dirname },
  },
};

export default postcssConfig;
