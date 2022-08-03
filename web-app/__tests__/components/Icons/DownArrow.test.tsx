import React from 'react';
import renderer from 'react-test-renderer';
import DownArrow from '../../../components/Icons/DownArrow';

describe('DownArrow component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<DownArrow />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
