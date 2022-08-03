import React from 'react';
import renderer from 'react-test-renderer';
import Text from '../../../components/Text/Text';

describe('Text component', () => {
  test('it renders properly with default props', () => {
    const tree = renderer.create(<Text>Text</Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with non-default color', () => {
    const tree = renderer.create(<Text color="red-200">Text</Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with size prop', () => {
    const tree = renderer.create(<Text size="3xl">Text</Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with weight prop', () => {
    const tree = renderer.create(<Text weight="extrabold">Text</Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly with className prop', () => {
    const tree = renderer.create(<Text className="my-custom-class">Text</Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
