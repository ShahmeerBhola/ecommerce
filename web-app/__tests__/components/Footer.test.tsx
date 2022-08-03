import React from 'react';
import renderer from 'react-test-renderer';
import Footer from '../../components/Footer';
import { ToastProvider } from '../utils';

describe('Footer component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <Footer />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
