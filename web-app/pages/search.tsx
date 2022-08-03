import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import WordPressClient from '../utils/clients/wordpress';
import SearchResultsPage from '../components/Search';
import {
  checkOutLargeSelectionText,
  shouldRedirectSearchToSingleProductPage,
  constructUrl,
  serverSideRedirect,
} from '../utils';

type Props = {
  products: WordPress.Product[];
  pagination: WordPress.PaginationResponse;
  filters: Search.Filter[];
};

const TextSearchResultsPage: React.FunctionComponent<Props> = ({ products, pagination, filters }) => {
  const router = useRouter();
  const searchTerm = router.query.s as string;
  const title = `"${searchTerm}" Search Results`;

  return (
    <SearchResultsPage
      header={title}
      filters={filters}
      products={products}
      pagination={pagination}
      seoProps={{
        openGraph: {
          url: constructUrl({ page: 'search', queryParams: { s: searchTerm } }),
          title,
          description: checkOutLargeSelectionText(searchTerm),
        },
      }}
    />
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, res }) => {
  const { s, ...queryParams } = query as StringMap;

  if (!s) {
    // no search term provided...
    serverSideRedirect(constructUrl({ page: '' }), res);
  }

  const {
    data: { products },
    pagination,
  } = await WordPressClient.getProducts<API.ProductsResponse>({ s, ...queryParams }, { products: [] });
  const categories = await WordPressClient.getProductCategories();
  const filters: Search.Filter[] = [
    {
      placeholder: 'Category',
      options: categories.map(({ name, slug }) => ({
        label: name,
        value: slug,
      })),
      category: true,
      queryKey: '',
    },
  ];

  shouldRedirectSearchToSingleProductPage(products, res);

  return {
    props: {
      products,
      pagination,
      filters,
    },
  };
};

export default TextSearchResultsPage;
