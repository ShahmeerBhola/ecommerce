import React from 'react';
import renderer from 'react-test-renderer';
import CheckoutPage from '../../pages/checkout';
import { ToastProvider } from '../utils';

describe('CheckoutPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <CheckoutPage shippingCountries={{}} shippingStates={{}} sellingCountries={{}} sellingStates={{}} />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
