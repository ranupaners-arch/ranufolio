import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ranupane.kukerjain.dev',
  vite: {
    plugins: [tailwindcss()],
  },
});
