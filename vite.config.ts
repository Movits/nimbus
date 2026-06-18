import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base precisa bater com o caminho do GitHub Pages: https://movits.github.io/nimbus/
export default defineConfig({
  base: '/nimbus/',
  plugins: [react()],
})
