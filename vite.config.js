import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000
  },
  esbuild: {
    jsxInject: `import "regenerator-runtime/runtime";`,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Prevents chunk warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Moves node_modules into a separate chunk
          }
        },
      },
    },
  },
})
