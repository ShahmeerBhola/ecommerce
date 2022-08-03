import React from 'react';
import renderer from 'react-test-renderer';
import BrandsPage from '../../pages/brands';
import { ToastProvider, generateMockBrand } from '../utils';

describe('BrandsPage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <BrandsPage brands={[generateMockBrand(1), generateMockBrand(2), generateMockBrand(3)]} />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
