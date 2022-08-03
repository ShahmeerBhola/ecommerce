import React from 'react';
import renderer from 'react-test-renderer';
import PhotoContainer from '../../../components/Container/PhotoContainer';

describe('Container component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <PhotoContainer image="my-truck.png">
          <p>Hello</p>
        </PhotoContainer>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default props', () => {
    const tree = renderer
      .create(
        <PhotoContainer
          image="my-truck2.png"
          className="hello-there"
          backgroundCover={false}
          backgroundClassName="background-class-name"
          minHeight="50"
        >
          <p>Hello</p>
        </PhotoContainer>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when backgroundCover is set to true', () => {
    const tree = renderer
      .create(
        <PhotoContainer image="my-truck3.png" backgroundCover={true}>
          <p>Hello</p>
        </PhotoContainer>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
