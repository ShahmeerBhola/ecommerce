import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
    api: {
        bodyParser: false,
    },
};

const proxy = createProxyMiddleware({
    // target: process.env.WORDPRESS_API_URL || 'http://localhost:3000/wp-json/api/v1',
    target: 'https://dev.wordpress.standoutspecialties.com/wp-json/api/v1',
    pathRewrite: { '^/api': '' },
    changeOrigin: true,
});

export default proxy;
