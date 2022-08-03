import React from 'react';
import renderer from 'react-test-renderer';
import Price from '../../components/Price';

describe('Price component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Price price={24.99} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with size prop', () => {
    const tree = renderer.create(<Price price={28.49} size="2xl" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with weight prop', () => {
    const tree = renderer.create(<Price price={28.49} weight="bold" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
