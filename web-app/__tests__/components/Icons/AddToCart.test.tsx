import React from 'react';
import renderer from 'react-test-renderer';
import { generateMockProduct } from '../../utils';
import AddToCart from '../../../components/Icons/AddToCart';

describe('AddToCart component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<AddToCart product={generateMockProduct()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // TODO: test that when it is clicked it calls addLineItem context method
});
