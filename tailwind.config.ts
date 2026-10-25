import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        jiggle: {
          "0%, 100%": { transform: "rotate(-1.2deg)" },
          "50%": { transform: "rotate(1.2deg)" },
        },
        flashBorder: {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "#22c55e", boxShadow: "0 0 12px rgba(34, 197, 94, 0.6)" },
        },
      },
      animation: {
        jiggle: "jiggle 0.18s ease-in-out infinite",
        flash: "flashBorder 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
