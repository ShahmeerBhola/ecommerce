import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockProduct, generateMockPagination } from '../../utils';
import SearchResults from '../../../components/Product/SearchResults';

describe('SearchResults component', () => {
  const products = [generateMockProduct(1), generateMockProduct(2), generateMockProduct(3)];
  const pagination = generateMockPagination(3, 1, 1, 25);

  test('it renders properly', () => {
    const tree = renderer.create(<SearchResults products={products} pagination={pagination} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
