import React from 'react';
import { GetServerSideProps } from 'next';
import isEmpty from 'lodash/isEmpty';

import {
    checkOutLargeSelectionText,
    constructCategoryOpenGraphUrl,
    determineBrandOpenGraphImage,
    fetchFiltersBasedOnCategory,
    shouldRedirectSearchToSingleProductPage,
} from '../../../utils';
import WordPressClient from '../../../utils/clients/wordpress';

import SearchResultsPage from '../../../components/Search';

type Props = {
    brand: WordPress.ProductBrand | {};
    category: WordPress.ProductCategory | {};
    products: WordPress.Product[];
    pagination: WordPress.PaginationResponse;
    filters: Search.Filter[];
};

type QueryProps = {
    slug: string;
    brandSlug: string;
    page: string;
    sort: WordPress.ProductSortOption;
};

const ViewProductsByBrandAndCategoryPage: React.FunctionComponent<Props> = ({
    brand: brd,
    category: cat,
    products,
    pagination,
    filters,
}) => {
    const brand = brd as WordPress.ProductBrand;
    const category = cat as WordPress.ProductCategory;
    const title = `${brand.name} ${category.name}`;

    return (
        <SearchResultsPage
            header={title}
            filters={filters}
            products={products}
            pagination={pagination}
            seoProps={{
                openGraph: {
                    url: constructCategoryOpenGraphUrl(`${category.slug}/${brand.slug}`),
                    title,
                    description: checkOutLargeSelectionText(title),
                    images: determineBrandOpenGraphImage(brand),
                },
            }}
        />
    );
};

export const getServerSideProps: GetServerSideProps<Props, QueryProps> = async ({ params: p, query, res }) => {
    const { slug, brandSlug } = p as QueryProps;
    const {
        data: { brand, category, products },
        pagination,
    } = await WordPressClient.getProducts<API.ProductsBrandCategoryResponse>(
        {
            ...query,
            brand: brandSlug,
            category: slug,
            page: query.page as string,
            sort: query.sort as WordPress.ProductSortOption,
        },
        { products: [], brand: {}, category: {} },
    );
    const allFilters = await fetchFiltersBasedOnCategory(category);
    const filters = allFilters.filter((filt) => filt.queryKey !== 'brand');
    const status = isEmpty(brand) || isEmpty(category) ? 404 : 200;

    shouldRedirectSearchToSingleProductPage(products, res);

    return {
        props: {
            brand,
            category,
            products,
            pagination,
            filters,
            status,
        },
    };
};

export default ViewProductsByBrandAndCategoryPage;
