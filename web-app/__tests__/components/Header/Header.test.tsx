import React from 'react';
import renderer from 'react-test-renderer';
import Header from '../../../components/Header';

describe('Header component', () => {
  test('it renders properly when transparentNavOnTopOfPage is false', () => {
    const tree = renderer.create(<Header transparentNavOnTopOfPage={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when transparentNavOnTopOfPage is true', () => {
    const tree = renderer.create(<Header transparentNavOnTopOfPage />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // TODO:
  // test('scrolling past 400px y-axis mark properly changes classes', () => {
  //   const tree = renderer.create(<Header transparentNavOnTopOfPage />).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  // TODO:
  // test('clicking on mobile hamburger icon opens up mobile nav window', () => {
  //   const tree = renderer.create(<Header transparentNavOnTopOfPage />).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
