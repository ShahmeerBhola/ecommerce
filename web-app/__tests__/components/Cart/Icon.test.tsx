import React from 'react';
import renderer from 'react-test-renderer';
import CartIcon from '../../../components/Cart/Icon';
import * as utils from '../../../utils';

describe('CartIcon component', () => {
  test('it renders properly when quantity = 0', () => {
    const tree = renderer.create(<CartIcon />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when quantity > 0', () => {
    jest.spyOn(utils, 'calculateCartTotalQuantity').mockImplementationOnce(() => 5);

    const tree = renderer.create(<CartIcon />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
