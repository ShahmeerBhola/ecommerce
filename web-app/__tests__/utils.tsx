import React from 'react';
import { ToastProvider as RNToastProvider } from 'react-toast-notifications';
import { CartContext } from '../components/Cart/Context';

export const ToastProvider: React.FunctionComponent = ({ children }) => <RNToastProvider>{children}</RNToastProvider>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCartProvider = (component: JSX.Element, providerProps: any): JSX.Element => (
  <CartContext.Provider value={providerProps}>{component}</CartContext.Provider>
);

export const generateMockImage = (): WordPress.Image => ({
  id: 3220,
  src: 'https://wordpress.standoutspecialties.local/wp-content/uploads/2020/06/CK17-3016-5x500-SF.jpg',
  name: 'CK17-3016-5&#215;500-SF',
  alt: '',
});

export const generateMockPagination = (
  total: number,
  total_pages: number,
  page: number,
  per_page: number,
): WordPress.Pagination => ({
  total,
  total_pages,
  page,
  per_page,
});

export const generateMockBrand = (id = 5): WordPress.ProductBrand => ({
  id,
  name: 'Test Brand',
  description: 'This is our test brand',
  slug: `test-brand-${id}`,
  image: generateMockImage(),
});

export const generateMockCategory = (id = 5): WordPress.ProductCategory => ({
  id,
  name: 'Test Category',
  description: 'This is our test category',
  slug: `test-category-${id}`,
  image: generateMockImage(),
  menu_order: 1,
  count: 5,
});

export const generateMockProduct = (id = 3219): WordPress.Product => ({
  id,
  name: 'American Force Battery CC CK17 30x16',
  slug: `ck17-3016-5x500-sf-american-force-battery-cc-ck17-30x16-5x5-${id}`,
  description: '',
  sku: `CK17-3016-5x500-SF-${id}`,
  price: 11536,
  total_sales: 0,
  backordered: false,
  categories: [generateMockCategory(210), generateMockCategory(209)],
  featured_image: generateMockImage(),
  brand: generateMockBrand(),
});

export const generateMockLineItem = (
  id: number,
  quantity: number,
  name: string,
  slug: string,
  price: number,
  featured_image: WordPress.Image | null,
  quantity_sold_in: number,
): Cart.HydratedLineItem => ({
  id,
  quantity,
  name,
  slug,
  price,
  featured_image,
  quantity_sold_in,
});
