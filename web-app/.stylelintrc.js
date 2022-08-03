module.exports = {
    extends: ['stylelint-config-sass-guidelines', 'stylelint-a11y/recommended'],
    ignoreFiles: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
        'max-nesting-depth': 4,
        'a11y/media-prefers-reduced-motion': null,
        indentation: 4,
    },
};
