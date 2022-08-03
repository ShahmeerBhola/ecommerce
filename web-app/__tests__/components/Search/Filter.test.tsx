import React from 'react';
import renderer from 'react-test-renderer';
import Filter from '../../../components/Search/Filter';

describe('Filter component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Filter />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
