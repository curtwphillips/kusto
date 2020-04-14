module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': 'off',
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'no-useless-escape': 0,
    quotes: ['error', 'single'],
    semi: [2, 'always'],
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
