import React from 'react';
import renderer from 'react-test-renderer';
import RightCarrot from '../../../components/Icons/RightCarrot';

describe('RightCarrot component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<RightCarrot onClick={(): void => console.log('hello')} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
