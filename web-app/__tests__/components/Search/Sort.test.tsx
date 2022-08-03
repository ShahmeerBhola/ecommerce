import React from 'react';
import renderer from 'react-test-renderer';
import Sort from '../../../components/Search/Sort';

describe('Sort component', () => {
  const onChange = (): void => console.log('hello');

  test('it renders properly when value is blank string', () => {
    const tree = renderer.create(<Sort value="" onChange={onChange} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when value is price-lth', () => {
    const tree = renderer.create(<Sort value="price-lth" onChange={onChange} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
