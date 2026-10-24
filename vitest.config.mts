import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
      'server-only': `${import.meta.dirname}/tests/stubs/server-only.ts`,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
