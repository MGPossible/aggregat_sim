import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: set VITE_BASE=/REPOSITORY/ in the repository variable.
// User/organization pages and custom domains use VITE_BASE=/ (the default).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
});