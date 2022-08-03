import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockProduct } from '../../utils';
import FeaturedProduct from '../../../components/Product/FeaturedProduct';

describe('FeaturedProduct component', () => {
  const product = generateMockProduct();

  test('it renders properly', () => {
    const tree = renderer.create(<FeaturedProduct product={product} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when className is provided', () => {
    const tree = renderer.create(<FeaturedProduct product={product} className="hello-there" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
