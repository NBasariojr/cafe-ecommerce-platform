// ESLint 9.x flat config
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier disables conflicting ESLint formatting rules
  prettier,

  // Project-wide custom rules
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'error',

      // General
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'object-shorthand': 'warn',
    },
  },

  // Looser rules for scripts and config files
  {
    files: ['**/*.config.*', '**/scripts/**/*.ts', '**/scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Seed + test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/seed.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.expo/**',
    ],
  }
)
