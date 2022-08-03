import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import isEmpty from 'lodash/isEmpty';

import { ProductProvider, ProductPage } from '../../components/Product';

import WordPressClient from '../../utils/clients/wordpress';
import {
    fetchAddSpareFromParams,
    fetchSelectedWheelFromParams,
    addSpareIsRelevant,
    transformProductsToGoogleAnalyticsProducts,
} from '../../utils';
import { sendEnhancedEcommerceEvent } from '../../utils/googleAnalytics';

type Props = {
    product: WordPress.Product | {};
    query: StringMap; // could possibly be an issue if the same query param is supplied multiple times..
};

type QueryProps = {
    slug: string;
    selected_wheel: string;
    year: string;
    make: string;
    model: string;
    trim: string;
    add_spare: string;
};

const SingleProductPage: NextPage<Props> = ({ product: prd, query: queryParams }) => {
    const product = prd as WordPress.Product;

    const defaultProductState = {
        product,
        variation: null,
        currentAttributes: {},
        queryParams,
    };

    sendEnhancedEcommerceEvent('view_item', transformProductsToGoogleAnalyticsProducts([product]));

    return (
        <ProductProvider defaultState={defaultProductState}>
            <ProductPage />
        </ProductProvider>
    );
};

export const getServerSideProps: GetServerSideProps<Props, QueryProps> = async ({ query: queryParams }) => {
    const query = queryParams as StringMap;
    const product = await WordPressClient.getProduct(
        query.slug,
        addSpareIsRelevant(query) ? fetchAddSpareFromParams(query) : 'false',
        fetchSelectedWheelFromParams(query),
    );
    const status = isEmpty(product) ? 404 : 200;

    return { props: { product, query, status } };
};

export default SingleProductPage;
