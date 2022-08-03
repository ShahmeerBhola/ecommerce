import React from 'react';
import renderer from 'react-test-renderer';
import Submit from '../../../components/Form/Submit';

describe('Submit component', () => {
  test('it renders properly when isSubmitting is false', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting={false}>
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly default loadingMessage when isSubmitting is true', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting={true}>
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when isSubmitting is true and loadingMessage is provided', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting={true} loadingMessage="Yoooo loading!">
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when classNameProp is provided', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting className="my-custom-class">
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when disabled is false', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting disabled={false}>
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when disabled is true', () => {
    const tree = renderer
      .create(
        <Submit isSubmitting disabled={true}>
          <p>Hello</p>
        </Submit>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
