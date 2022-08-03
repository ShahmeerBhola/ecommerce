import React from 'react';
import renderer from 'react-test-renderer';
import Input from '../../../components/Form/Input';

describe('Input component', () => {
  const radioOptions = [
    {
      value: 'foo',
      label: 'Foo',
    },
    {
      value: 'bar',
      label: 'Bar',
    },
  ];

  test('it renders properly for radio type when value is blank', () => {
    const tree = renderer.create(<Input name="test_radio" type="radio" value="" options={radioOptions} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when value is non-blank', () => {
    const tree = renderer.create(<Input name="test_radio" type="radio" value="foo" options={radioOptions} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type with placeholder', () => {
    const tree = renderer
      .create(
        <Input name="test_radio" placeholder="This is the placeholder" type="radio" value="" options={radioOptions} />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when placeholder is blank string', () => {
    const tree = renderer
      .create(<Input name="test_radio" placeholder="" type="radio" value="" options={radioOptions} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when options is an empty array', () => {
    const tree = renderer.create(<Input name="test_radio" type="radio" value="" options={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when onChange and onBlur are provided', () => {
    const tree = renderer
      .create(
        <Input
          name="test_radio"
          type="radio"
          value=""
          options={radioOptions}
          onChange={(): void => {
            console.log('hello');
          }}
          onBlur={(): void => {
            console.log('hello');
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when disabled prop is false', () => {
    const tree = renderer
      .create(<Input name="test_radio" type="radio" disabled={false} value="" options={radioOptions} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for radio type when disabled prop is true', () => {
    const tree = renderer
      .create(<Input name="test_radio" type="radio" disabled value="" options={radioOptions} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for checkbox type', () => {
    const tree = renderer
      .create(<Input name="test_checkbox" type="checkbox" value="true" placeholder="Placeholder" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for checkbox type when disabled is false', () => {
    const tree = renderer
      .create(<Input name="test_checkbox" type="checkbox" value="false" disabled={false} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for checkbox type when disabled is true', () => {
    const tree = renderer.create(<Input name="test_checkbox" type="checkbox" value="false" disabled />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for textarea type', () => {
    const tree = renderer
      .create(
        <Input
          name="test_textarea"
          type="textarea"
          value="yoooooo"
          placeholder="This is the placeholder"
          onChange={(): void => {
            console.log('hello');
          }}
          onBlur={(): void => {
            console.log('hello');
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly for other types', () => {
    const tree = renderer
      .create(
        <Input
          name="test_text"
          type="text"
          value="yoooooo"
          disabled
          placeholder="This is the placeholder"
          onChange={(): void => {
            console.log('hello');
          }}
          onBlur={(): void => {
            console.log('hello');
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when borderColor prop is supplied', () => {
    const tree = renderer.create(<Input name="test_text" type="text" value="" borderColor="border-red-200" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
