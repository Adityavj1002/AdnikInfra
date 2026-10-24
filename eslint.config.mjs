import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import security from 'eslint-plugin-security'

const htmlSinkMessage =
  'Raw HTML sinks bypass React escaping. Render text nodes instead (ARCHITECTURE.md §11.4).'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  security.configs.recommended,
  {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'react/no-danger': 'error',
      // noopener is required; noreferrer is optional so referral credit links keep their referrer.
      'react/jsx-no-target-blank': ['error', { allowReferrer: true }],
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: htmlSinkMessage },
        { property: 'outerHTML', message: htmlSinkMessage },
        { property: 'insertAdjacentHTML', message: htmlSinkMessage },
        { object: 'document', property: 'write', message: htmlSinkMessage },
        { object: 'document', property: 'writeln', message: htmlSinkMessage },
      ],
      // Flags every bracket access; typed keys and Zod-validated input cover the real risk.
      'security/detect-object-injection': 'off',
    },
  },
  {
    // Tests deliberately contain hostile strings (XSS / injection payloads) as data.
    files: ['tests/**'],
    rules: { 'no-script-url': 'off' },
  },
  {
    // The single audited exception: JSON-LD serialised through safeJsonLd().
    files: ['src/components/seo/JsonLd.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
])
