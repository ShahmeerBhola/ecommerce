import React from 'react';
import renderer from 'react-test-renderer';
import RightArrow from '../../../components/Icons/RightArrow';

describe('RightArrow component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<RightArrow />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
