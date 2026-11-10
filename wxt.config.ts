import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tictic Tokn',
    description: 'A live token meter that floats over AI chat sites. Local only.',
    permissions: [],
  },
});
