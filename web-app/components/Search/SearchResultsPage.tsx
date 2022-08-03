import React, { useState, useEffect } from 'react';
import { NextSeoProps } from 'next-seo';

import { productIsTire, numberWithCommas, transformProductsToGoogleAnalyticsProducts } from '../../utils';
import { sendEnhancedEcommerceEvent } from '../../utils/googleAnalytics';
import WordPressClient from '../../utils/clients/wordpress';

import Pagination from './Pagination';
import Filters from './Filters';
import SearchResult from './SearchResult';
import Layout from '../Layout';
import Container from '../Container';
import Text from '../Text';
import { RedDivider, GrayDivider } from '../Divider';
import { MagnifyingGlassIcon } from '../Icons';
import ProductCategoryCubes from '../ProductCategory';
import WheelTirePackageBanner from '../WheelTirePackageBanner';

type Props = {
    header: string;
    products: WordPress.Product[];
    pagination: WordPress.PaginationResponse;
    filters: Search.Filter[];
    seoProps?: NextSeoProps;
};

const SearchResultsPage: React.FunctionComponent<Props> = ({ products, filters, header, seoProps, ...rest }) => {
    const [categories, updateCategories] = useState<WordPress.ProductCategory[]>([]);
    const noProducts = products.length === 0;

    useEffect(() => {
        async function fetchCategories(): Promise<void> {
            const categories = await WordPressClient.getProductCategories();
            updateCategories(categories);
        }

        if (noProducts) {
            fetchCategories();
        } else {
            sendEnhancedEcommerceEvent('view_item_list', transformProductsToGoogleAnalyticsProducts(products));
        }
    }, [noProducts, products]);

    const NoResults = (): JSX.Element => (
        <Container>
            <div className="flex flex-col">
                <div className="flex flex-wrap items-center my-5">
                    <MagnifyingGlassIcon large />
                    <Text className="ml-5">No results were found for your search</Text>
                </div>
                <Text color="text-black" weight="font-bold" size="text-2xl" className="uppercase mt-10">
                    Try Searching By Category
                </Text>
                <RedDivider mx="mx-0" my="my-5" />
                <ProductCategoryCubes categories={categories} />
            </div>
        </Container>
    );

    const ResultsWithPagination = (): JSX.Element => {
        const pagination = rest.pagination as WordPress.Pagination;
        return (
            <div>
                <div className="flex flex-wrap">
                    {products.map((product) => (
                        <SearchResult product={product} key={product.sku} />
                    ))}
                </div>
                <GrayDivider my="my-5" />
                <div className="flex flex-wrap justify-between items-center">
                    <Text size="text-sm" className="my-3 sm:my-0">
                        Total search results&nbsp;&nbsp;
                        <span className="text-red-100">{numberWithCommas(pagination.total.toString())}</span>
                    </Text>
                    <Pagination pagination={pagination} />
                </div>
            </div>
        );
    };

    const Results = (): JSX.Element => {
        // marginTop of 4px is applied due to the 4px transparent border on SearchResult components
        return (
            <div className="flex flex-col lg:flex-row pt-0 pb-5 lg:pt-10 lg:pb-10 px-0 lg:px-5 lg:container lg:mx-auto">
                <div className="block lg:hidden w-full">
                    <Filters filters={filters} mobile />
                </div>
                <div className="hidden lg:block mr-3" style={{ marginTop: '4px' }}>
                    <Filters filters={filters} />
                </div>
                <div className="w-full mt-5 lg:mt-0 px-5 lg:px-0">
                    <ResultsWithPagination />
                </div>
            </div>
        );
    };

    return (
        <Layout headerTitle={header} useContainer={false} seoProps={{ title: header, ...seoProps }}>
            <WheelTirePackageBanner hideBanner={products.length === 0 || !productIsTire(products[0].categories)} />
            {products.length > 0 ? <Results /> : <NoResults />}
        </Layout>
    );
};

export default SearchResultsPage;
