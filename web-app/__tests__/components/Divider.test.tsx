import React from 'react';
import renderer from 'react-test-renderer';
import Divider from '../../components/Divider';

describe('Divider component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<Divider />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default props', () => {
    const tree = renderer.create(<Divider color="gray-400" width="full" my="25" borderThickness="1" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
