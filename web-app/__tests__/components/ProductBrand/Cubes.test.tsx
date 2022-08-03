import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockBrand } from '../../utils';
import Cubes from '../../../components/ProductBrand/Cubes';

describe('ProductBrand Cubes component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Cubes brands={[generateMockBrand(1), generateMockBrand(2)]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
