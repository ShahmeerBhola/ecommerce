import React from 'react';
import renderer from 'react-test-renderer';
import Container from '../../../components/Container/Container';

describe('Container component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <Container>
          <p>Hello</p>
        </Container>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when bgColor prop is set', () => {
    const tree = renderer
      .create(
        <Container bgColor="gray-75">
          <p>Hello</p>
        </Container>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default props', () => {
    const tree = renderer
      .create(
        <Container className="hello-there" minHeight="500" paddingY="25">
          <p>Hello</p>
        </Container>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
