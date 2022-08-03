import React from 'react';
import renderer from 'react-test-renderer';
import H2 from '../../../components/Text/H2';

describe('H2 component', () => {
  test('it renders properly with default color', () => {
    const tree = renderer.create(<H2>Header</H2>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default color', () => {
    const tree = renderer.create(<H2 color="red-200">Header</H2>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with className prop', () => {
    const tree = renderer.create(<H2 className="my-custom-class">Header</H2>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
