import React from 'react';
import renderer from 'react-test-renderer';
import InputGroup from '../../../components/Form/InputGroup';

describe('InputGroup component', () => {
  test('it renders properly with default props', () => {
    const tree = renderer
      .create(
        <InputGroup>
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with className prop', () => {
    const tree = renderer
      .create(
        <InputGroup className="my-default-class">
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it doesnt render error message if touched is false and error is null', () => {
    const tree = renderer
      .create(
        <InputGroup touched={false} error={null}>
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it doesnt render error message if touched is false and error is non-null', () => {
    const tree = renderer
      .create(
        <InputGroup touched={false} error="There is an error!">
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it doesnt render error message if touched is true and error is null', () => {
    const tree = renderer
      .create(
        <InputGroup touched={true} error={null}>
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders error message if touched is true and error is non-null', () => {
    const tree = renderer
      .create(
        <InputGroup touched={true} error="There is an error!">
          <input type="text" />
        </InputGroup>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
