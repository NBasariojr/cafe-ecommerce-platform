/** @type {import("prettier").Config} */
const config = {
  // Core style
  singleQuote: true,
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'es5',

  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // End of line — LF everywhere (prevents Windows/Mac diffs)
  endOfLine: 'lf',

  // Per-language overrides
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: { printWidth: 120 },
    },
    {
      files: ['*.md'],
      options: { proseWrap: 'always', printWidth: 80 },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: { singleQuote: false },
    },
  ],
}

export default config
