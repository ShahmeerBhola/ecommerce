import React from 'react';
import renderer from 'react-test-renderer';
import CartPage from '../../pages/cart';
import { ToastProvider } from '../utils';

describe('CartPage component', () => {
  test('it renders properly when cart is empty', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <CartPage />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  // TODO: implement
  // test('it renders properly when cart is non-empty', () => {
  //   const tree = renderer
  //     .create(
  //       <ToastProvider>
  //         <CartPage />
  //       </ToastProvider>,
  //     )
  //     .toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
