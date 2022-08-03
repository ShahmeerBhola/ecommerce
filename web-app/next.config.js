/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins');
const withSass = require('@zeit/next-sass');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const {
    ANALYZE,
    NODE_ENV,
    VERCEL_GITHUB_COMMIT_SHA,
    WORDPRESS_API_URL,
    SENTRY_AUTH_TOKEN,
    SENTRY_ORG,
    SENTRY_PROJECT,
} = process.env;
const plugins = [[withSass], [withBundleAnalyzer({ enabled: ANALYZE === 'true' })]];

if (NODE_ENV === 'production') {
    // dont use service worker locally.. makes hot reloading a PITA
    plugins.push([
        withPWA,
        {
            pwa: {
                dest: 'public',
            },
        },
    ]);
}

const config = {
    poweredByHeader: false,
    generateBuildId: async () => {
        if (VERCEL_GITHUB_COMMIT_SHA) {
            return VERCEL_GITHUB_COMMIT_SHA;
        } else {
            return `${new Date().getTime()}`;
        }
    },
    env: {
        wordPressAPIUrl: WORDPRESS_API_URL || 'http://localhost:3000/api',
    },
    webpack: (config, { isServer, buildId }) => {
        // https://github.com/vercel/next.js/blob/canary/examples/with-sentry/next.config.js

        // In `pages/_app.js`, Sentry is imported from @sentry/node. While
        // @sentry/browser will run in a Node.js environment, @sentry/node will use
        // Node.js-only APIs to catch even more unhandled exceptions.
        //
        // This works well when Next.js is SSRing your page on a server with
        // Node.js, but it is not what we want when your client-side bundle is being
        // executed by a browser.
        //
        // Luckily, Next.js will call this webpack function twice, once for the
        // server and once for the client. Read more:
        // https://nextjs.org/docs#customizing-webpack-config
        //
        // So ask Webpack to replace @sentry/node imports with @sentry/browser when
        // building the browser's bundle
        if (!isServer) {
            config.resolve.alias['@sentry/node'] = '@sentry/browser';
        }

        if (SENTRY_AUTH_TOKEN && SENTRY_ORG && SENTRY_PROJECT) {
            config.plugins.push(
                new SentryWebpackPlugin({
                    authToken: SENTRY_AUTH_TOKEN,
                    org: SENTRY_ORG,
                    project: SENTRY_PROJECT,
                    // https://github.com/getsentry/sentry-webpack-plugin/issues/185#issuecomment-624401139
                    release: buildId,
                    include: '.next',
                    ignore: ['node_modules'],
                    urlPrefix: '~/_next',
                }),
            );
        }

        return config;
    },
    webpackDevMiddleware: (config) => {
        // https://dev.to/codemochi/hot-module-reloading-with-next-js-docker-development-environment-in-4-steps-32i8
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        };
        return config;
    },
};

module.exports = withPlugins(plugins, config);
