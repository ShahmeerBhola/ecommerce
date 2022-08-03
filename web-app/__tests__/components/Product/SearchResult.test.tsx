import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockProduct } from '../../utils';
import SearchResult from '../../../components/Product/SearchResult';

describe('SearchResult component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<SearchResult product={generateMockProduct()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
