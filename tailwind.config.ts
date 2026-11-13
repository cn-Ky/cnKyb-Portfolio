import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#0b0e13", steel: "#3b5a73", sodium: "#d9a441", blood: "#8c2a22", bone: "#d8d2c4", paper: "#e6d8a8" },
    fontFamily: { title: ["var(--f-title)"], type: ["var(--f-type)"] },
  } },
} satisfies Config;
