import tseslint from 'typescript-eslint';
import baseConfig from '../../eslint.config.js';

export default tseslint.config(baseConfig, {
  files: ['src/**/*.ts'],
  ignores: ['**/*.d.ts'],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
