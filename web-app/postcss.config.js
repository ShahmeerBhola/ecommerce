// https://github.com/tailwindcss/setup-examples/pull/15/files#diff-96dba2da82ad42166e3d30ce89533d7a
// https://github.com/tailwindcss/setup-examples/tree/master/examples/nextjs
// https://nextjs.org/docs/advanced-features/customizing-postcss-config

module.exports = {
  plugins: {
    'postcss-import': {}, // plugin to transform @import rules by inlining content, must be first
    tailwindcss: {},
    // plugin that fixs known flexbox bugs
    'postcss-flexbugs-fixes': {
      // convert modern CSS into something most browsers can understand, determining the polyfills you need based on your targeted browsers or runtime environments
      'postcss-preset-env': {
        // parse CSS and add vendor prefixes to CSS rules using values from Can I Use
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'custom-properties': false,
        },
      },
    },
    'postcss-nested': {}, // plugin to unwrap nested rules like how Sass does it
    'postcss-custom-properties': {}, // lets you use Custom Properties in CSS
  },
};
