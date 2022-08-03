import React, { FC } from 'react';
import { GetStaticProps } from 'next';

import config from '../config';
import WordPressClient from '../utils/clients/wordpress';

import Layout from '../components/Layout';
import Container from '../components/Container';
import { Hero, Categories, LiftKits, FeaturedProducts, Search } from '../components/Pages/Home';

type Props = {
    productCategories: WordPress.ProductCategory[];
    featuredProducts: WordPress.Product[];
    truckYears: string[];
    wheelDiameters: string[];
    wheelWidths: string[];
    wheelBoltPatterns: string[];
    wheelBrands: string[];
};

const IndexPage: FC<Props> = ({ productCategories, featuredProducts, ...props }) => {
    console.log(props.truckYears);
    return (
        <Layout seoProps={{ title: config.siteName, titleTemplate: '%s' }} useContainer={false} transparentNav>
            <Hero>
                <Search data={props} />
            </Hero>
            <Container className="mt-23rem md:mt-8rem">
                <Categories categories={productCategories} />
                <LiftKits />
                {!!featuredProducts.length && <FeaturedProducts products={featuredProducts} />}
            </Container>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
    const {
        categories,
        featured_products,
        truck_years,
        wheel_diameters,
        wheel_widths,
        wheel_bolt_patterns,
        wheel_brands,
    } = await WordPressClient.getHomePageData();

    return {
        props: {
            productCategories: categories,
            featuredProducts: featured_products,
            truckYears: truck_years,
            wheelDiameters: wheel_diameters,
            wheelWidths: wheel_widths,
            wheelBoltPatterns: wheel_bolt_patterns,
            wheelBrands: wheel_brands,
        },
    };
};

export default IndexPage;
