import React from 'react';
import renderer from 'react-test-renderer';
import CategoryPage from '../../pages/category/[slug]';
import { ToastProvider, generateMockCategory, generateMockProduct, generateMockPagination } from '../utils';

describe('CategoryPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <CategoryPage
            category={generateMockCategory()}
            products={[generateMockProduct(1), generateMockProduct(2)]}
            pagination={generateMockPagination(100, 4, 1, 25)}
          />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
