import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise palette — restrained, near-monochrome
        ink: {
          950: "#07090d",
          900: "#0b0f14",
          850: "#0e131a",
          800: "#11161e",
          750: "#161c25",
          700: "#1b2230",
          650: "#222a37",
          600: "#2c3543",
          500: "#3a4555",
          400: "#5a6678",
          300: "#7e8a9c",
          200: "#a4adbd",
          100: "#cfd5e0",
          50: "#e8ecf2",
        },
        accent: {
          DEFAULT: "#3d7eff",
          600: "#2e6ce8",
          900: "#0e2a66",
        },
        amber: {
          DEFAULT: "#d99a2b",
          900: "#3a2806",
        },
        crit: {
          DEFAULT: "#d94a4a",
          900: "#3c0e0e",
        },
        ok: {
          DEFAULT: "#2f9a72",
          900: "#0c2a20",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": "10.5px",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
