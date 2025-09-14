import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Match Manager - Soccer Coach Assistant',
    short_name: 'Match Manager',
    description: 'Offline-first PWA for volunteer soccer coaches to manage substitutions, playing time, and formations during games',
    start_url: '/',
    display: 'standalone',
    background_color: '#059669',
    theme_color: '#059669',
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icons/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml'
      }
    ],
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['sports', 'productivity', 'utilities']
  }
}