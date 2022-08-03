import React from 'react';
import renderer from 'react-test-renderer';
import ContactPage from '../../pages/contact';
import { ToastProvider } from '../utils';

describe('ContactPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <ContactPage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
