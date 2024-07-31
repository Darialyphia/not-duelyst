module.exports = {
  root: true,
  extends: ['daria/vue'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    'no-undef': 'off',
    'no-redeclare': 'off',
    'no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-setup-props-destructure': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-floating-promises': 'warn'
  }
};
