import React, { FC, useContext } from 'react';
import { ProductJsonLd } from 'next-seo';

import config from '../../../config';
import { constructProductUrl, productHasPriceRange, convertPriceToString } from '../../../utils';

import Layout from '../../Layout';

import { ProductContext } from './Context';

type Props = {};

const PageLayout: FC<Props> = ({ children }) => {
    const {
        state: { product },
    } = useContext(ProductContext);

    const { id, name, description, slug, variations, price, brand, is_purchasable, sku } = product as WordPress.Product;

    const { siteName, defaultCurrencyCode } = config;
    const productUrl = constructProductUrl({ slug, includeBase: true });
    const hasPriceRange = productHasPriceRange(variations);
    const productPriceString = convertPriceToString(price);

    const meta = [
        {
            property: 'product:price:amount',
            content: productPriceString,
        },
        {
            property: 'product:price:currency',
            content: defaultCurrencyCode,
        },
    ];

    return (
        <>
            <ProductJsonLd
                sku={id.toString()}
                productName={name}
                // images={[featuredImageUrl]}
                description={description}
                brand={brand ? brand.name : ''}
                offers={[
                    {
                        price: productPriceString,
                        priceCurrency: defaultCurrencyCode,
                        itemCondition: 'http://schema.org/NewCondition',
                        availability: is_purchasable ? 'http://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        url: productUrl,
                        seller: {
                            name: siteName,
                        },
                    },
                ]}
                mpn={sku} // Manufacturer Part Number
            />
            <Layout
                seoProps={{
                    title: name,
                    description,
                    canonical: productUrl,
                    openGraph: {
                        title: name,
                        type: 'product',
                        description,
                        url: productUrl,
                        site_name: siteName,
                        // images: [
                        //     {
                        //         url: featuredImageUrl,
                        //         alt: featuredImage ? featuredImage.alt : '',
                        //     },
                        // ],
                    },
                    additionalMetaTags: hasPriceRange ? meta : [],
                }}
                useContainer={false}
            >
                {children}
            </Layout>
        </>
    );
};

export default PageLayout;
