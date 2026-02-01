export default [
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: (await import('eslint-plugin-react')).default,
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
      'react-refresh': (await import('eslint-plugin-react-refresh')).default
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URL: 'readonly',
        AbortController: 'readonly',
        // Runtime globals
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',

      // Ensure JSX identifiers count as "used"
      'react/jsx-uses-vars': 'error',

      // React 17+ JSX transform (no need for React in scope)
      'react/react-in-jsx-scope': 'off',

      // Recommended hooks + Vite refresh safety
      ...((await import('eslint-plugin-react-hooks')).default.configs?.recommended?.rules || {}),
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  }
];
