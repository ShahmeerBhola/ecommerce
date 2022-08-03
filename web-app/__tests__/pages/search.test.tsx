import React from 'react';
import renderer from 'react-test-renderer';
import SearchPage from '../../pages/search';
import { ToastProvider, generateMockProduct, generateMockPagination } from '../utils';

describe('SearchPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <SearchPage
            query={{ sort: '' }}
            products={[generateMockProduct(1), generateMockProduct(2)]}
            pagination={generateMockPagination(100, 4, 1, 25)}
          />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
