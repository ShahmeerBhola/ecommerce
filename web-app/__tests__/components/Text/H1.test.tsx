import React from 'react';
import renderer from 'react-test-renderer';
import H1 from '../../../components/Text/H1';

describe('H1 component', () => {
  test('it renders properly with default color', () => {
    const tree = renderer.create(<H1>Header</H1>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default color', () => {
    const tree = renderer.create(<H1 color="red-200">Header</H1>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
