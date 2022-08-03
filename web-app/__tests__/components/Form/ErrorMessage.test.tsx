import React from 'react';
import renderer from 'react-test-renderer';
import ErrorMessage from '../../../components/Form/ErrorMessage';

describe('ErrorMessage component', () => {
  test('it renders nothing if error is null and touched is false', () => {
    const tree = renderer.create(<ErrorMessage error={null} touched={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders nothing if error is non-null and touched is false', () => {
    const tree = renderer.create(<ErrorMessage error="This is not valid!" touched={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders nothing if error is null and touched is true', () => {
    const tree = renderer.create(<ErrorMessage error={null} touched />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders message if error is non-null and touched is true', () => {
    const tree = renderer.create(<ErrorMessage touched error="This is not valid!" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
