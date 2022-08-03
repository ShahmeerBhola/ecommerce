import React from 'react';
import renderer from 'react-test-renderer';
import { useCartProvider } from '../../utils';
import { generateMockLineItem, generateMockImage } from '../../utils';
import LineItems from '../../../components/Cart';

describe('LineItems component', () => {
  const lineItems = [
    generateMockLineItem(1234, 25, 'Test Item', 'test-item', 49.99, null),
    generateMockLineItem(1235, 4, 'Test Item 2', 'test-item 2', 599.49, generateMockImage()),
  ];

  test('it renders properly when hideQuantity is true', () => {
    const tree = renderer.create(useCartProvider(<LineItems hideQuantity />, { lineItems })).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideQuantity is false', () => {
    const tree = renderer.create(useCartProvider(<LineItems hideQuantity={false} />, { lineItems })).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideDelete is true', () => {
    const tree = renderer.create(useCartProvider(<LineItems hideDelete />, { lineItems })).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideDelete is false', () => {
    const tree = renderer.create(useCartProvider(<LineItems hideDelete={false} />, { lineItems })).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
