import React from 'react';
import renderer from 'react-test-renderer';
import Form from '../../../components/Form';
import { ToastProvider } from '../../utils';

describe('Form component', () => {
  test('it renders properly', () => {
    const initialValues = {
      name: '',
    };

    const tree = renderer
      .create(
        <ToastProvider>
          <Form<typeof initialValues>
            form={{
              sections: [
                {
                  id: 'contact_information',
                  label: 'Yoooo dog',
                  fields: [],
                },
              ],
              submit: {
                className: 'submit-field-class-name',
                text: 'Submit that Form',
                loadingMessage: 'Non default loading message',
              },
            }}
            validationSchema={(): void => {
              console.log('validation schema');
            }}
            initialValues={initialValues}
            onSubmit={(): void => {
              console.log('yo');
            }}
          />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
