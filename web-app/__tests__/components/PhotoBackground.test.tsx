import React from 'react';
import renderer from 'react-test-renderer';
import PhotoBackground from '../../components/PhotoBackground';

describe('PhotoBackground component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <PhotoBackground image="my-truck.jpg">
          <p>Hello</p>
        </PhotoBackground>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with className props', () => {
    const tree = renderer
      .create(
        <PhotoBackground image="my-truck2.jpg" className="hello-there">
          <p>Hello</p>
        </PhotoBackground>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when cover prop is false', () => {
    const tree = renderer
      .create(
        <PhotoBackground image="my-truck3.jpg" cover={false}>
          <p>Hello</p>
        </PhotoBackground>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when cover prop is true', () => {
    const tree = renderer
      .create(
        <PhotoBackground image="my-truck3.jpg" cover>
          <p>Hello</p>
        </PhotoBackground>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
