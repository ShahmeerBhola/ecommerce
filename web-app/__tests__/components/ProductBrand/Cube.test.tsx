import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockBrand } from '../../utils';
import Cube from '../../../components/ProductBrand/Cube';

describe('ProductBrand Cube component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Cube size="250" brand={generateMockBrand()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
