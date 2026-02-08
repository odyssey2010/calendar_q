import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/calendar_q/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.exchangerate-api\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exchangerate-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24시간
              },
            },
          },
          {
            urlPattern: /^https:\/\/date\.nager\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'holidays-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
              },
            },
          },
        ],
      },
      manifest: {
        name: 'CalendarQ',
        short_name: 'CalendarQ',
        start_url: '/calendar_q/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: '/calendar_q/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/calendar_q/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
