import React from 'react';
import renderer from 'react-test-renderer';
import ItemsInTheCart from '../../../components/Cart/ItemsInTheCart';
import * as utils from '../../../utils';

describe('ItemsInTheCart component', () => {
  test('it renders properly when quantity = 0', () => {
    const tree = renderer.create(<ItemsInTheCart />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when quantity > 0', () => {
    jest.spyOn(utils, 'calculateCartTotalQuantity').mockImplementationOnce(() => 5);

    const tree = renderer.create(<ItemsInTheCart />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
