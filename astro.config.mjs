// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://ph.franciscoperalta.com',
  trailingSlash: 'always',

  integrations: [
    react(),
    // Spanish lives at the root, English under /en/. The sitemap links each page to its translation.
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-AR', en: 'en' } },
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});
