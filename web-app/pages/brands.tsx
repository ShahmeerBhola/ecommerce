import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { GrayDividerWithBlackText } from '../components/Divider';
import Button from '../components/Button';
import ProductBrands from '../components/ProductBrand';
import { constructCanonicalUrl, constructUrl } from '../utils';
import WordPressClient from '../utils/clients/wordpress';

type Props = {
    categoriesBrands: WordPress.ProductCategoryBrands[];
};

const ProductCategoriesBrands: React.FunctionComponent<Props> = ({ categoriesBrands }) => {
    const title = 'Brands';
    return (
        <Layout
            seoProps={{
                title,
                openGraph: {
                    url: constructCanonicalUrl({ page: 'brands' }),
                    title,
                    description: 'Check out our large selection of wheel and tire brands',
                },
            }}
            bgColor="bg-gray-50"
            containerClassName="flex-col"
            headerTitle={title}
        >
            {categoriesBrands.map(({ category: { slug, name }, brands }) => {
                if (brands.length === 0) {
                    return null;
                }

                return (
                    <div key={slug} className="flex flex-wrap w-full">
                        <div className="flex w-full items-center">
                            <GrayDividerWithBlackText text={name}>
                                {brands.length > 6 && (
                                    <Button
                                        className="ml-10 whitespace-no-wrap"
                                        inverted
                                        link={constructUrl({ page: 'category', extra: `${slug}/brands` })}
                                    >
                                        Show More
                                    </Button>
                                )}
                            </GrayDividerWithBlackText>
                        </div>

                        <ProductBrands brands={brands.slice(0, 6)} linkCategorySlug={slug} />
                    </div>
                );
            })}
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const categoriesBrands = await WordPressClient.getProductBrands();
    return {
        props: {
            categoriesBrands,
        },
    };
};

export default ProductCategoriesBrands;
