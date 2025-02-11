module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    // Enable typescript-specific recommended rules
    'plugin:@typescript-eslint/recommended',
    'plugin:nuxt/recommended',
    // Turns off all rules that are unnecessary or might conflict with Prettier (needs to be last)
    'prettier',
  ],
  plugins: ['unused-imports'],
  rules: {
    // Workaround for bug https://github.com/nuxt/eslint-config/issues/147
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description',
      },
    ],
    // Don't report unused imports (this is handled by prettier)
    'unused-imports/no-unused-imports': 'off',
    // Report unused variables (except the ones prefixed with an underscore)
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // Ensure void operator is not used, except for variable assignment or function return (might be handy for promises)
    'no-void': ['error', { allowAsStatement: true }],
    // Demote this to warning as long as we are still using cjs modules
    'import/named': 'warn',
    // Import order is handled by prettier (which is incompatible with this rule: https://github.com/simonhaenisch/prettier-plugin-organize-imports/issues/65)
    'import/order': 'off',
  },
  overrides: [
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        // TODO: Use recommended rules once we follow most conventions
        // Make sure that mutations returns not a scalar type (best practice: have special return type for each mutation)
        // TODO: Set this to error once we follow this convention
        '@graphql-eslint/no-scalar-result-type-on-mutation': 'warn',
        // Make sure to not prefix id names with typename, i.e. 'id' instead of 'userId'.
        '@graphql-eslint/no-typename-prefix': 'error',
        // Requires all types to be reachable at some level by root level fields.
        '@graphql-eslint/no-unreachable-types': 'error',
        // Enforces that deprecated fields or enum values are not in use by operations.
        // TODO: Set this to error once we follow this convention
        '@graphql-eslint/no-deprecated': 'warn',
        // Enforces unique fragment name.
        '@graphql-eslint/unique-fragment-name': 'error',
        // Enforces unique operation names.
        // TODO: Does not work yet
        // '@graphql-eslint/unique-operation-name': 'error',
        // Requires to use """ or " for adding a GraphQL description instead of #.
        // TODO: Does not work yet, so set to warn
        '@graphql-eslint/no-hashtag-description': 'warn',
        // Requires sname for your GraphQL operations.
        '@graphql-eslint/no-anonymous-operations': 'error',
        '@graphql-eslint/naming-convention': [
          'error',
          {
            OperationDefinition: {
              style: 'PascalCase',
              // Make sure to not add the operation type to the name of the operation, e.g. 'user' instead of 'userQuery'.
              forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
              forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
            },
          },
        ],
        // Requires all deprecation directives to specify a reason
        '@graphql-eslint/require-deprecation-reason': ['error'],
        // Enforces descriptions in your type definitions
        '@graphql-eslint/require-description': [
          'warn',
          {
            types: true,
            FieldDefinition: true,
            ObjectTypeDefinition: true,
          },
        ],
        // Checks for duplicate fields in selection set, variables in operation definition, or in arguments set of a field.
        '@graphql-eslint/no-duplicate-fields': ['error'],
        // Requires mutation argument to be always called "input" and input type to be called Mutation name + "Input".
        // TODO: Set this to error once we follow this convention
        '@graphql-eslint/input-name': ['warn', { checkInputType: true }],
        // Spaced-comment rule only works for JS-style comments using /* or // but not for GraphQL comments using #
        'spaced-comment': 'off',
      },
    },
    {
      files: ['*.tsx', '*.ts', '*.jsx', '*.js'],
      processor: '@graphql-eslint/graphql',
    },
    {
      files: ['*.ts', '*.vue'],
      // Parser supporting vue files
      parser: 'vue-eslint-parser',
      parserOptions: {
        // Use ts parser for ts files and for the script tag in vue files
        parser: '@typescript-eslint/parser',
        // Correct root
        tsconfigRootDir: __dirname,
        // Path to tsconfig to enable rules that require type information
        project: './tsconfig.json',
        // Correctly handle vue files
        extraFileExtensions: ['.vue'],
      },
      extends: [
        // Enable recommended rules for typescript that use typing information (may be CPU intensive)
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
    },
    {
      files: ['layouts/**/*.vue', 'pages/**/*.vue'],
      rules: {
        // Layouts and pages cannot be confused with HTML components as they are used differently, so no need to worry about single-word names
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      // Special treatment for test files
      files: ['**/*.test.ts', '**/*.spec.ts'],
      plugins: ['jest'],
      rules: {
        // Disable typescript rule for unbound methods...
        '@typescript-eslint/unbound-method': 'off',
        // ...and enable the jest-specific one
        'jest/unbound-method': 'error',
      },
    },
  ],
}
