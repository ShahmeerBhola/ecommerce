import React from 'react';
import renderer from 'react-test-renderer';
import ColorContainer from '../../../components/Container/ColorContainer';

describe('ColorContainer component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ColorContainer color="gray-300">
          <p>Hello</p>
        </ColorContainer>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default props', () => {
    const tree = renderer
      .create(
        <ColorContainer color="gray-300" className="hello-there" minHeight="500">
          <p>Hello</p>
        </ColorContainer>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
