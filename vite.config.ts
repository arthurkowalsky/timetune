import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'data/*.json'],
      manifest: {
        name: 'TimeTune - Music Timeline Game',
        short_name: 'TimeTune',
        description: 'Guess the release year of songs and build your timeline!',
        theme_color: '#8b5cf6',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/timetune/',
        scope: '/timetune/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.youtube\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  base: '/timetune/',
})
