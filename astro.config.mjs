// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://sena-sakuramoto.github.io',
	base: '/archi-prisma-site',
	vite: {
		plugins: [tailwindcss()],
	},
});
