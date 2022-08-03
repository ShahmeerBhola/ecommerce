import React from 'react';
import renderer from 'react-test-renderer';
// import { render } from 'enzyme';
// import { useCartProvider } from '../../utils';
import { generateMockLineItem } from '../../utils';
import LineItem from '../../../components/Cart/LineItem';

describe('LineItem component', () => {
  const lineItem = generateMockLineItem(1234, 25, 'Test Item', 'test-item', 49.99, null);

  test('it renders properly', () => {
    const tree = renderer.create(<LineItem lineItem={lineItem} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideQuantity prop = false', () => {
    const tree = renderer.create(<LineItem lineItem={lineItem} hideQuantity={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideQuantity prop = true', () => {
    const tree = renderer.create(<LineItem lineItem={lineItem} hideQuantity />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideDelete prop = false', () => {
    const tree = renderer.create(<LineItem lineItem={lineItem} hideDelete={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('it renders properly when hideDelete prop = true', () => {
    const tree = renderer.create(<LineItem lineItem={lineItem} hideDelete />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // TODO:
  // test('it properly calls updateLineItemQuantity when NumberInput is changed', () => {
  //   const updateLineItemQuantity = jest.fn(() => null);

  //   const element = render(useCartProvider(<LineItem lineItem={lineItem} />, { updateLineItemQuantity }));
  // });

  // TODO:
  // test('it properly calls deleteLineItem when delete button is clicked', () => { });
});
