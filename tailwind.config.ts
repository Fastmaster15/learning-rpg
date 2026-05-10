import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f4ef",
        panel: "#fffdf8",
        line: "#e4ded4",
        accent: "#2f7f8f"
      }
    }
  },
  plugins: []
};

export default config;

