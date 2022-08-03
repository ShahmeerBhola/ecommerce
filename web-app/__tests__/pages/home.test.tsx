import React from 'react';
import renderer from 'react-test-renderer';
import HomePage from '../../pages/index';
import { ToastProvider, generateMockCategory, generateMockProduct } from '../utils';

describe('HomePage component', () => {
  test('it renders properly', () => {
    const tree = renderer
      .create(
        <ToastProvider>
          <HomePage
            truckYears={['2018', '2019', '2020']}
            wheelDiameters={['diameter-foo', 'diameter-bar', 'diameter-baz']}
            wheelBrands={['brand1', 'brand2', 'brand3']}
            wheelWidths={['width1', 'width2', 'width3']}
            wheelBoltPatterns={['boltPattern1', 'boltPattern2', 'boltPattern3']}
            productCategories={[
              generateMockCategory(1),
              generateMockCategory(2),
              generateMockCategory(3),
              generateMockCategory(4),
              generateMockCategory(5),
            ]}
            featuredProducts={[
              generateMockProduct(1),
              generateMockProduct(2),
              generateMockProduct(3),
              generateMockProduct(4),
              generateMockProduct(5),
              generateMockProduct(6),
            ]}
          />
        </ToastProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
