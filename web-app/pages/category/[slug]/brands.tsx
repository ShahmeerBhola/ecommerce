import React from 'react';
import { GetServerSideProps } from 'next';
import { singular as makeNounSingular } from 'pluralize';
import isEmpty from 'lodash/isEmpty';

import WordPressClient from '../../../utils/clients/wordpress';
import {
    checkOutLargeSelectionText,
    constructCategoryOpenGraphUrl,
    determineCategoryOpenGraphImage,
} from '../../../utils';

import Layout from '../../../components/Layout';
import ProductBrands from '../../../components/ProductBrand';

type Props = {
    categoryBrands: WordPress.ProductCategoryBrands | WordPress.ProductCategoryBrands<{}, []>;
};

type QueryProps = {
    slug: string;
};

const ViewCategoryBrandsPage: React.FunctionComponent<Props> = ({ categoryBrands: { category: cat, brands } }) => {
    const category = cat as WordPress.ProductCategory;
    const { name, slug } = category;

    const title = `${makeNounSingular(name || '')} Brands`;

    return (
        <Layout
            seoProps={{
                title,
                openGraph: {
                    url: constructCategoryOpenGraphUrl(`${slug}/brands`),
                    title,
                    description: checkOutLargeSelectionText(title),
                    images: determineCategoryOpenGraphImage(category),
                },
            }}
            bgColor="bg-gray-50"
            headerTitle={title}
        >
            <ProductBrands brands={brands} linkCategorySlug={slug} />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<Props, QueryProps> = async ({ params }) => {
    const categoryBrands = await WordPressClient.getProductCategoryBrands((params as QueryProps).slug);
    const status = typeof categoryBrands?.category !== 'object' || isEmpty(categoryBrands?.category) ? 404 : 200;

    return {
        props: {
            categoryBrands,
            status,
        },
    };
};

export default ViewCategoryBrandsPage;
