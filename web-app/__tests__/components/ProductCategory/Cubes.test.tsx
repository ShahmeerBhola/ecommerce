import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockCategory } from '../../utils';
import Cubes from '../../../components/ProductCategory/Cubes';

describe('ProductCategory Cubes component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Cubes categories={[generateMockCategory(1), generateMockCategory(2)]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
