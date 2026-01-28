import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '0.0.0.0', // 👈 makes the dev server accessible to other devices
    port: 5000,       // or any port you prefer
  },
})
