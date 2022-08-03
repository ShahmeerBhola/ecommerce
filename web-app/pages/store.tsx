import React from 'react';
import { GetServerSideProps } from 'next';
import ProductCategoryCubes from '../components/ProductCategory';
import Layout from '../components/Layout';
import WordPressClient from '../utils/clients/wordpress';
import { constructCanonicalUrl } from '../utils';

type Props = {
  categories: WordPress.ProductCategory[];
};

const StorePage: React.FunctionComponent<Props> = ({ categories }) => {
  const title = 'Store';
  return (
    <Layout
      seoProps={{
        title,
        openGraph: {
          url: constructCanonicalUrl({ page: 'store' }),
          title,
          description: 'Check out our large selection of wheels and tires',
        },
      }}
      headerTitle={title}
    >
      <ProductCategoryCubes categories={categories} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const categories = await WordPressClient.getProductCategories();
  return {
    props: {
      categories,
    },
  };
};

export default StorePage;
