import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'August',
    short_name: 'August',
    description: 'Your AI Health Companion',
    start_url: '/chat',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/android-favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/favicon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
