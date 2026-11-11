import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// models, livery and track textures come from the project's own public/ folder, two levels up
export default defineConfig({ plugins: [react()], publicDir: '../../public', build: { outDir: 'dist', chunkSizeWarningLimit: 4000 } })
