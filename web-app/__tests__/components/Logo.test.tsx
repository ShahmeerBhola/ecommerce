import React from 'react';
import renderer from 'react-test-renderer';
import Logo from '../../components/Logo';

describe('Logo component', () => {
  test('it renders properly with renderLink set to true', () => {
    const tree = renderer.create(<Logo renderLink />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with renderLink set to false', () => {
    const tree = renderer.create(<Logo renderLink={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
