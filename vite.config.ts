/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const chunkMap: Record<string, string[]> = {
  vendor:   ['react', 'react-dom'],
  router:   ['react-router-dom'],
  motion:   ['framer-motion'],
  supabase: ['@supabase/supabase-js'],
  zustand:  ['zustand'],
  ui:       ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-sheet'],
}

function manualChunks(id: string): string | undefined {
  for (const [chunk, pkgs] of Object.entries(chunkMap)) {
    if (pkgs.some((pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
      return chunk
    }
  }
  return undefined
}

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
