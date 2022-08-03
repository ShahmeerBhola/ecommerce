const Field: React.FunctionComponent = () => (
  <div>
    <p>Mocked field</p>
    <input type="text" />
  </div>
);

jest.mock('../../../components/Form/Field', () => ({
  __esModule: true,
  default: Field,
}));

import React from 'react';
import renderer from 'react-test-renderer';
import Section from '../../../components/Form/Section';

describe('Section component', () => {
  type IV = {
    first_name: '';
  };

  test('it renders properly when hidden is false', () => {
    const tree = renderer
      .create(
        <Section<IV>
          fields={[
            {
              name: 'first_name',
              type: 'text',
              placeholder: 'hello',
            },
          ]}
          hidden={false}
        >
          <div>
            <p>Yooo</p>
          </div>
        </Section>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hidden is true', () => {
    const tree = renderer
      .create(
        <Section<IV>
          fields={[
            {
              name: 'first_name',
              type: 'text',
              placeholder: 'hello',
            },
          ]}
          hidden
        >
          <div>
            <p>Yooo</p>
          </div>
        </Section>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when label prop is provided', () => {
    const tree = renderer
      .create(
        <Section<IV>
          fields={[
            {
              name: 'first_name',
              type: 'text',
              placeholder: 'hello',
            },
          ]}
          hidden={false}
          label="My Section Label"
        >
          <div>
            <p>Yooo</p>
          </div>
        </Section>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
