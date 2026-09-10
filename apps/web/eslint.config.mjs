import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint flat config (ESLint 9) — Next.js 16 mengirim flat config native.
 * Sebelumnya `pnpm lint` gagal total karena tidak ada config sama sekali.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Copy tenant dirender dari JSON berbahasa Indonesia — aturan ini terlalu
      // berisik untuk kutip/tanda seru dalam konten.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
