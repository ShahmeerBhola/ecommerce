import React from 'react';
import renderer from 'react-test-renderer';
import Select from '../../../components/Form/Select';

describe('Select component', () => {
  const options = [
    {
      value: 'foo',
      label: 'Foo',
    },
    {
      value: 'bar',
      label: 'Bar',
    },
  ];

  test('it renders properly when value is empty string', () => {
    const tree = renderer.create(<Select name="my-select" value="" options={options} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when value is non-empty string', () => {
    const tree = renderer.create(<Select name="my-select" value="foo" options={options} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly the placeholder', () => {
    const tree = renderer
      .create(<Select name="my-select" value="" placeholder="My Placeholder" options={options} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when disabled is true', () => {
    const tree = renderer.create(<Select name="my-select" value="" disabled options={options} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when borderColor is non-default value', () => {
    const tree = renderer
      .create(<Select name="my-select" value="" borderColor="border-red-200" options={options} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when onChange and onBlur props provided', () => {
    const tree = renderer
      .create(
        <Select
          name="my-select"
          value=""
          onChange={(): void => {
            console.log('onChange');
          }}
          onBlur={(): void => {
            console.log('onBlur');
          }}
          options={options}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
