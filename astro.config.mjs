import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  prefetch: false,
  // Keep Astro's processed scripts external for script-src 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
});
