import React from 'react';
import renderer from 'react-test-renderer';
import NavLinks from '../../../components/Header/NavLinks';

describe('NavLinks component', () => {
  test('it renders properly when mobile is false', () => {
    const tree = renderer
      .create(<NavLinks mobile={false} navTagClass="nav-tag-class" aTagClass="a-tag-class" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when mobile is true', () => {
    const tree = renderer.create(<NavLinks mobile navTagClass="nav-tag-class" aTagClass="a-tag-class" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
