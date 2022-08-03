import React from 'react';
import renderer from 'react-test-renderer';
import H3 from '../../../components/Text/H3';

describe('H3 component', () => {
  test('it renders properly with default color', () => {
    const tree = renderer.create(<H3>Header</H3>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default color', () => {
    const tree = renderer.create(<H3 color="red-200">Header</H3>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with className prop', () => {
    const tree = renderer.create(<H3 className="my-custom-class">Header</H3>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with uppercase prop = false', () => {
    const tree = renderer.create(<H3 uppercase={false}>Header</H3>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with uppercase prop = true', () => {
    const tree = renderer.create(<H3 uppercase>Header</H3>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
