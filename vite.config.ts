import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Relative base so assets resolve correctly on GitHub Pages project sites
// (e.g. https://user.github.io/repo-name/) instead of the site root.
export default defineConfig({
  base: './',
  plugins: [react()],
})
