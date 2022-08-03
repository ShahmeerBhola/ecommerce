import React from 'react';
import renderer from 'react-test-renderer';
import NumberInput from '../../../components/Form/NumberInput';

describe('NumberInput component', () => {
  test('it renders properly', () => {
    const tree = renderer.create(<NumberInput value={5} onChange={(): void => console.log('Hello!')} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
