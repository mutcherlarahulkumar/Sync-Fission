// The lint script has been in package.json since the start, but there was no
// config for it to find — `npm run lint` failed with "couldn't find a
// configuration file" rather than linting anything. This is that config.
module.exports = {
    root: true,
    env: { browser: true, es2021: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: 'detect' } },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        // Route elements are passed as children; the prop-types plugin can't
        // see through that and this project doesn't use prop-types anywhere.
        'react/prop-types': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
};
