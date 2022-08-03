import React from 'react';
import renderer from 'react-test-renderer';
import LeftCarrot from '../../../components/Icons/LeftCarrot';

describe('LeftCarrot component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<LeftCarrot onClick={(): void => console.log('hello')} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
