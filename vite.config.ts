import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// domínio próprio na raiz (nimbuswear.com.br) → base '/'. (era '/nimbus/' na project page do GitHub Pages)
export default defineConfig({
  base: '/',
  plugins: [react()],
})
