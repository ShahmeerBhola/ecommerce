import React, { FC } from 'react';
import { GetServerSideProps } from 'next';
import isEmpty from 'lodash/isEmpty';

import WordPressClient from '../../utils/clients/wordpress';

import Layout from '../../components/Layout';
import { Catalog, Results, NoProducts } from '../../components/Pages/Search';
import WheelTirePackageBanner from '../../components/WheelTirePackageBanner';

import {
    checkOutLargeSelectionText,
    constructCategoryOpenGraphUrl,
    determineCategoryOpenGraphImage,
    fetchFiltersBasedOnCategory,
    shouldRedirectSearchToSingleProductPage,
} from '../../utils';

type Props = {
    category: WordPress.ProductCategory | {};
    products: WordPress.Product[];
    pagination: WordPress.PaginationResponse;
    filters: Search.Filter[];
};

const SingleCategoryPage: FC<Props> = ({ category, products, pagination, filters }) => {
    const hasProducts = !isEmpty(products);
    const cat = category as WordPress.ProductCategory;
    const title = cat.name;
    const isWheels = cat.slug === 'wheels';
    const openGraph = {
        url: constructCategoryOpenGraphUrl(cat.slug),
        title,
        description: checkOutLargeSelectionText(title),
        images: determineCategoryOpenGraphImage(cat),
    };

    return (
        <Layout headerTitle={title} seoProps={{ title, openGraph }} useContainer={false}>
            <WheelTirePackageBanner hideBanner={isWheels || !hasProducts} />
            {hasProducts ? (
                <Catalog pagination={pagination as WordPress.Pagination} filters={filters}>
                    <Results products={products} />
                </Catalog>
            ) : (
                <NoProducts />
            )}
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, res }) => {
    const { slug, ...queryParams } = query as StringMap;

    console.log('Category is ' + slug);

    const {
        data: { category, products },
        pagination,
    } = await WordPressClient.getProducts<API.ProductsCategoryResponse>(
        { category: slug, ...queryParams },
        { category: {}, products: [] },
    );

    const filters = await fetchFiltersBasedOnCategory(category);
    const status = isEmpty(category) ? 404 : 200;

    shouldRedirectSearchToSingleProductPage(products, res);

    return {
        props: {
            category,
            products,
            pagination,
            filters,
            status,
        },
    };
};

export default SingleCategoryPage;
