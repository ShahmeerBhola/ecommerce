import React from 'react';
import renderer from 'react-test-renderer';
import BrandPage from '../../pages/brand/[slug]';
import { ToastProvider, generateMockBrand, generateMockProduct, generateMockPagination } from '../utils';

describe('BrandPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <BrandPage
            brand={generateMockBrand()}
            products={[generateMockProduct(1), generateMockProduct(2)]}
            pagination={generateMockPagination(100, 4, 1, 25)}
          />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
