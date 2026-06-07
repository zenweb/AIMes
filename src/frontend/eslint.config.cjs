const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const vuePlugin = require('eslint-plugin-vue')
const vueParser = require('vue-eslint-parser')

module.exports = [
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', 'test-results/**'],
  },
  {
    files: ['src/**/*.{ts,vue}', 'tests/unit/**/*.ts', 'tests/e2e/**/*.ts', 'vitest.config.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        afterEach: 'readonly',
        beforeEach: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        document: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        localStorage: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        vi: 'readonly',
        window: 'readonly',
      },
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      vue: vuePlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...vuePlugin.configs['flat/recommended']
        .flatMap((config) => config.rules ? [config.rules] : [])
        .reduce((all, rules) => ({ ...all, ...rules }), {}),
      'vue/multi-word-component-names': 'off',
      'vue/comment-directive': 'off',
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/no-multi-spaces': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/components/chat/ChatPanel.vue'],
    rules: {
      // ChatPanel escapes message text before rendering the small markdown subset.
      'vue/no-v-html': 'off',
    },
  },
]
