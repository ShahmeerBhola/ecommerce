import React from 'react';
import renderer from 'react-test-renderer';
import Circle from '../../components/Circle';

describe('Circle component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <Circle>
          <div>children</div>
        </Circle>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default props', () => {
    const tree = renderer
      .create(
        <Circle size="60" fontSize="3xl" className="hello-there">
          <p>Hello</p>
        </Circle>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
