const path = require('path');
const fetch = require('isomorphic-unfetch');
const sitemap = require('nextjs-sitemap-generator');

// Ideally we could just include ./utils/clients/wordpress.ts but I've yet to
// find a way to run a .ts file script. We would need to compile it first down to .js
// then run it
class WordPressRestAPIClient {
    async _makeRequest({ url, errorReturn }) {
        const response = await fetch(`${process.env.wordPressAPIUrl}/${url}`);
        if (response.status !== 200) {
            return { data: errorReturn, pagination: {} };
        }

        return await response.json();
    }

    async getProductCategories() {
        const { data } = await this._makeRequest({
            url: 'products/categories',
            errorReturn: [],
        });
        return data;
    }

    async getProductBrandsGroupedByCategory() {
        const { data } = await this._makeRequest({
            url: 'products/brands',
            errorReturn: [],
        });
        return data;
    }

    async getAllProductSlugs() {
        const { data } = await this._makeRequest({
            url: 'products/slugs',
            errorReturn: [],
        });
        return data;
    }
}

// Top level "await" statements are not yet allowed
// https://github.com/tc39/proposal-top-level-await
(async () => {
    const WordPressClient = new WordPressRestAPIClient();

    let productSlugs = await WordPressClient.getAllProductSlugs();
    let productCategories = await WordPressClient.getProductCategories();
    let brandsByCategoryResp = await WordPressClient.getProductBrandsGroupedByCategory();

    productSlugs = productSlugs.map((slug) => `/product/${slug}`);
    productCategories = productCategories.map(({ slug }) => `/category/${slug}`);

    let url;
    let brandsByCategory = [];
    let productsByBrandAndCategory = [];

    brandsByCategoryResp.map(({ category, brands }) => {
        url = `/category/${category.slug}/`;

        brands.map(({ slug }) => {
            productsByBrandAndCategory.push(`${url}${slug}`);
        });

        brandsByCategory.push(`${url}brands`);
    });

    const parentDir = path.normalize(__dirname + '/../');

    await sitemap({
        baseUrl: 'https://standoutspecialties.com',
        ignoreIndexFiles: true,
        targetDirectory: `${parentDir}/public`,
        pagesDirectory: `${parentDir}/pages`,
        nextConfigPath: `${parentDir}/next.config.js`,
        ignoredPaths: [
            'product/[slug]',
            'category/[slug]/[brandSlug]',
            'category/[slug]/brands',
            'category/[slug]',
            'cart',
            'checkout',
            'search',
            'order_confirmation',
            '404',
        ],
        extraPaths: [...productSlugs, ...productCategories, ...brandsByCategory, ...productsByBrandAndCategory],
    });

    console.log('✅ sitemap.xml generated!');
})();
