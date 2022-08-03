import React from 'react';
import renderer from 'react-test-renderer';
import CartTotal from '../../../components/Cart/CartTotal';

describe('CartTotal component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<CartTotal />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
