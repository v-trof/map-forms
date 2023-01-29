const react = {
    extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    plugins: ['react', 'react-hooks'],
    rules: {
        'react/prop-types': 'off',
    },
};

const imports = {
    extends: ['plugin:import/errors', 'plugin:import/typescript'],
    plugins: ['import'],
    rules: {
        'import/first': 'error',
        'import/dynamic-import-chunkname': 'error',
        'import/no-useless-path-segments': 'error',
        'import/no-duplicates': 'error',
        'import/named': 'error',
        'import/newline-after-import': 'error',
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                alphabetize: { order: 'asc' },
                groups: [
                    ['builtin', 'external'],
                    'internal',
                    'parent',
                    ['sibling', 'index'],
                    'unknown',
                ],
                pathGroups: [
                    {
                        pattern: '*.hbs',
                        patternOptions: { matchBase: true },
                        group: 'unknown',
                        position: 'after',
                    },
                    {
                        pattern: '*.+(less|css)',
                        patternOptions: { matchBase: true },
                        group: 'unknown',
                        position: 'after',
                    },
                ],
            },
        ],
    },
};

const prettier = {
    extends: ['plugin:prettier/recommended'],
    plugins: ['prettier'],
    rules: {},
};

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        ...react.extends,
        ...imports.extends,
        ...prettier.extends,
    ],
    plugins: [
        '@typescript-eslint',
        ...react.plugins,
        ...imports.plugins,
        ...prettier.plugins,
    ],
    rules: {
        ...react.rules,
        ...imports.rules,
        ...prettier.rules,
    },
    overrides: [
        {
            files: ['**/*.test.*'],
            rules: {
                'import/dynamic-import-chunkname': 'off',
                'max-nested-callbacks': 'off',
            },
        },
        {
            files: ['*.config.js', '.eslintrc.js'],
            env: {
                node: true,
            },
        },
    ],
};
