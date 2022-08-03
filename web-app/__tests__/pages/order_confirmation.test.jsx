import React from 'react';
import renderer from 'react-test-renderer';
import OrderConfirmationPage from '../../pages/order_confirmation';
import { ToastProvider } from '../utils';
import * as nextRouter from 'next/router';

describe('OrderConfirmationPage component', () => {
  test('it renders properly when order_id is specified in query params', () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({ query: { order_id: '1234' } }));

    const tree = renderer
      .create(
        <ToastProvider>
          <OrderConfirmationPage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when order_id is not specified in query params', () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({ query: { foo: 'bar' } }));

    const tree = renderer
      .create(
        <ToastProvider>
          <OrderConfirmationPage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
