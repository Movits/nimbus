import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// No ar, o GitHub Pages entrega public/<pasta>/index.html em /<pasta>/. O
// servidor de desenvolvimento do Vite não faz isso: /loja/ caía na landing e a
// vitrine só abria em /loja/index.html. Este plugin (só do `npm run dev`) repete
// a regra do Pages, para a vitrine e as gravuras poderem ser conferidas no local.
const pastasComoNoPages = (): Plugin => ({
  name: 'nimbus-pastas-como-no-pages',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [rota, busca] = (req.url ?? '').split('?')
      if (rota !== '/' && rota.endsWith('/') && fs.existsSync(path.join(server.config.publicDir, rota, 'index.html'))) {
        req.url = `${rota}index.html${busca ? `?${busca}` : ''}`
      }
      next()
    })
  },
})

// domínio próprio na raiz (nimbuswear.com.br) → base '/'. (era '/nimbus/' na project page do GitHub Pages)
export default defineConfig({
  base: '/',
  plugins: [react(), pastasComoNoPages()],
})
