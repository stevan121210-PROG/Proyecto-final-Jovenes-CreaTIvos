const path = require("node:path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  root: path.resolve(__dirname, "html"),
  base: process.env.VITE_BASE_PATH || "/",
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "html/index.html"),
        admin: path.resolve(__dirname, "html/admin.html"),
        servicios: path.resolve(__dirname, "html/servicios.html")
      }
    }
  }
});
