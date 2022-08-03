const mockedSentryEventId = 'abasdf234';
const mockedCaptureEvent = jest.fn(() => mockedSentryEventId);

jest.mock('@sentry/node', () => ({
  captureEvent: mockedCaptureEvent,
}));

import React from 'react';
import { render } from 'enzyme';
import { ToastProvider } from 'react-toast-notifications';
import config from '../config';
import { generateMockProduct, safelyStubAndThenCleanup } from './utils';
import * as utils from '../utils';

const mockIsQuery = (returnValue) => {
  return jest.spyOn(utils, '_isQuery').mockImplementationOnce(() => returnValue);
};

describe('sendSentryEvent function', () => {
  test('it should call Sentry.captureEvent function', () => {
    const message = 'Send an event';
    const extra = { foo: 'bar' };

    const eventId = utils.sendSentryEvent(message, extra);

    expect(eventId).toEqual(mockedSentryEventId);
    expect(mockedCaptureEvent).toHaveBeenCalledWith({ message, extra });
  });
});

describe('_isQuery function', () => {
  test('it should return false if all keys are not in query', () => {
    expect(utils._isQuery(['foo', 'bar', 'baz'], { hello: 'there', hi: 'baz' })).toBe(false);
  });

  test('it should return false if one key is missing in query', () => {
    expect(utils._isQuery(['foo', 'bar', 'baz'], { foo: 'there', bar: 'baz' })).toBe(false);
  });

  test('it should return true if all keys are in query', () => {
    expect(utils._isQuery(['foo', 'bar', 'baz'], { foo: '1', bar: '2', baz: '3' })).toBe(true);
  });
});

describe('isSearchByVehicleQuery function', () => {
  test('it should properly call _isQuery and return its result', () => {
    const mockedIsQuery = mockIsQuery(false);
    const query = {
      year: '2019',
      make: 'Ford',
      model: 'F-150',
      drive_trim: '4WD',
      suspension: 'Stock',
      trimming: 'Stock',
    };

    const result = utils.isSearchByVehicleQuery(query);

    expect(result).toEqual(false);
    expect(mockedIsQuery).toHaveBeenCalledWith(
      ['year', 'make', 'model', 'drive_trim', 'suspension', 'trimming'],
      query,
    );
  });
});

describe('isSearchBySizeBrandQuery function', () => {
  test('it should properly call _isQuery and return its result', () => {
    const mockedIsQuery = mockIsQuery(false);
    const query = {
      year: '2019',
      make: 'Ford',
      model: 'F-150',
      drive_trim: '4WD',
      suspension: 'Stock',
      trimming: 'Stock',
    };

    const result = utils.isSearchBySizeBrandQuery(query);

    expect(result).toEqual(false);
    expect(mockedIsQuery).toHaveBeenCalledWith(['diameter', 'width', 'bolt_pattern', 'brand'], query);
  });
});

describe('mapValuesToSelectOptions function', () => {
  test('it should properly map an array of strings to select options', () => {
    const values = ['foo', 'bar', 'baz'];
    expect(utils.mapValuesToSelectOptions(values)).toEqual(values.map((v) => ({ value: v, label: v })));
  });
});

describe('shouldHideFormSection function', () => {
  test('it should return true when field value equals hidden value and the section IDs match', () => {
    expect(
      utils.shouldHideFormSection(
        [
          {
            fieldName: 'name',
            fieldValue: 'Joey',
            sectionId: 'contact_information',
          },
        ],
        {
          name: 'Joey',
        },
        'contact_information',
      ),
    ).toEqual(true);
  });

  test('it should return false when field value does not match hidden value but the section IDs match', () => {
    expect(
      utils.shouldHideFormSection(
        [
          {
            fieldName: 'name',
            fieldValue: 'Joey',
            sectionId: 'contact_information',
          },
        ],
        {
          name: 'Bob',
        },
        'contact_information',
      ),
    ).toEqual(false);
  });

  test('it should return false when field value does match hidden value but none of the section IDs match', () => {
    expect(
      utils.shouldHideFormSection(
        [
          {
            fieldName: 'name',
            fieldValue: 'Joey',
            sectionId: 'contact_information',
          },
          {
            fieldName: 'name',
            fieldValue: 'Joey',
            sectionId: 'billing_information',
          },
        ],
        {
          name: 'Joey',
        },
        'shipping_information',
      ),
    ).toEqual(false);
  });
});

describe('numberWithCurrencyCode function', () => {
  test('it should return the number with the currency code', () => {
    expect(utils.numberWithCurrencyCode('50.05', '£')).toEqual('£50.05');
  });
});

describe('convertPriceToString function', () => {
  test.each([
    [59.37, '59.37'],
    [59.370459405945, '59.37'],
    [59, '59.00'],
  ])('given %f as price, returns %s', (input, expected) => {
    expect(utils.convertPriceToString(input)).toEqual(expected);
  });
});

describe('numberWithCommas function', () => {
  test.each([
    ['59999999', '59,999,999'],
    ['599999.37', '599,999.37'],
    ['599999', '599,999'],
    ['5999', '5,999'],
    ['59', '59'],
  ])('given %f as number, returns %s', (input, expected) => {
    expect(utils.numberWithCommas(input)).toEqual(expected);
  });
});

describe('formatPrice function', () => {
  test('it should return the result of numberWithCommas and numberWithCurrencyCode functions', () => {
    const price = 5999999999.99343;
    const numberWithCommasReturnValue = '5,999,999,999.99';
    const numberWithCurrencyCodeReturnValue = '$5,999,999,999.99';

    const mockedNumberWithCommas = jest
      .spyOn(utils, 'numberWithCommas')
      .mockImplementationOnce(() => numberWithCommasReturnValue);
    const mockedNumberWithCurrencyCode = jest
      .spyOn(utils, 'numberWithCurrencyCode')
      .mockImplementationOnce(() => numberWithCurrencyCodeReturnValue);

    const result = utils.formatPrice(price);

    expect(mockedNumberWithCommas).toHaveBeenCalledWith('5999999999.99');
    expect(mockedNumberWithCurrencyCode).toHaveBeenCalledWith(mockedNumberWithCommas.mock.results[0].value);
    expect(result).toEqual(numberWithCurrencyCodeReturnValue);
  });
});

describe('calculateCartTotalQuantity function', () => {
  test('it should accurately calculate the total number of items in the cart', () => {
    const input = [
      {
        id: 1,
        quantity: 5,
        name: 'foo',
        slug: 'foo',
        price: 14.43,
        featured_image: null,
      },
      {
        id: 1,
        quantity: 87,
        name: 'foo',
        slug: 'foo',
        price: 50000.34,
        featured_image: null,
      },
      {
        id: 1,
        quantity: 4909,
        name: 'foo',
        slug: 'foo',
        price: 1.59,
        featured_image: null,
      },
      {
        id: 4,
        quantity: 4909,
        name: 'foo',
        slug: 'foo',
        price: 1.59,
        featured_image: null,
      },
    ];
    const output = 4;

    expect(utils.calculateCartTotalQuantity(input)).toEqual(output);
  });
});

describe('calculateCartTotalPrice function', () => {
  test('it should accurately calculate total price', () => {
    const input = [
      {
        id: 1,
        quantity: 5,
        name: 'foo',
        slug: 'foo',
        price: 14.43,
        featured_image: null,
      },
      {
        id: 1,
        quantity: 87,
        name: 'foo',
        slug: 'foo',
        price: 50000.34,
        featured_image: null,
      },
      {
        id: 1,
        quantity: 4909,
        name: 'foo',
        slug: 'foo',
        price: 1.59,
        featured_image: null,
      },
    ];
    const output = 4357907.04;

    expect(utils.calculateCartTotalPrice(input)).toEqual(output);
  });
});

describe('calculateTotalDiscount function', () => {
  test('it should accurately calculate the total discount amount', () => {
    const input = [
      {
        name: 'Wheel and Tire discount',
        amount: 500.23,
        tax: 0,
      },
      {
        name: 'Miscellaneous discount',
        amount: 40.23,
        tax: 0,
      },
    ];

    expect(utils.calculateTotalDiscount(input)).toEqual(540.46);
  });
});

describe('calculateTotalTaxRate function', () => {
  test('it should accurately calculate the total tax rate', () => {
    const input = [
      {
        label: 'State Tax',
        rate: 0.0642,
        shipping: 'no',
        compound: 'no',
      },
      {
        label: 'Federal Tax',
        rate: 0.098,
        shipping: 'no',
        compound: 'no',
      },
    ];

    expect(utils.calculateTotalTaxRate(input)).toEqual(0.1622);
  });
});

describe('calculateLineItemTaxes function', () => {
  test('it should accurately calculate the total taxes for the passed lineItems', () => {
    const lineItems = [{ foo: 'basdfnasfd' }];
    const taxRates = [{ foo: 'basdfa2314' }];

    const cartTotalPrice = 50.27;
    const cartTotalTaxRate = 99.99;

    const mockedCalculateCartTotalPrice = jest
      .spyOn(utils, 'calculateCartTotalPrice')
      .mockImplementationOnce(() => cartTotalPrice);
    const mockedCalculateTotalTaxRate = jest
      .spyOn(utils, 'calculateTotalTaxRate')
      .mockImplementationOnce(() => cartTotalTaxRate);

    const result = utils.calculateLineItemTaxes(lineItems, taxRates);

    expect(result).toEqual(cartTotalPrice * (cartTotalTaxRate / 100));
    expect(mockedCalculateCartTotalPrice).toHaveBeenCalledWith(lineItems);
    expect(mockedCalculateTotalTaxRate).toHaveBeenCalledWith(taxRates);
  });
});

describe('calculateTotalOrderPrice function', () => {
  test('it should accurately calculate the total order price', () => {
    const lineItems = [{ foo: 'basdfnasfd' }];
    const discounts = [{ foo: 5454545.4545 }];
    const taxes = [{ foo: 'basdfa2314' }];
    const shippingMethodPrice = 5.99;

    const lineItemTotal = 99.85;
    const totalTaxes = 5.99;
    const totalDiscounts = 3.47;

    const mockedCalculateCartTotalPrice = jest
      .spyOn(utils, 'calculateCartTotalPrice')
      .mockImplementationOnce(() => lineItemTotal);
    const mockedCalculateLineItemTaxes = jest
      .spyOn(utils, 'calculateLineItemTaxes')
      .mockImplementationOnce(() => totalTaxes);
    const mockedCalculateTotalDiscount = jest
      .spyOn(utils, 'calculateTotalDiscount')
      .mockImplementationOnce(() => totalDiscounts);

    const result = utils.calculateTotalOrderPrice(lineItems, discounts, taxes, shippingMethodPrice);

    expect(result).toEqual(lineItemTotal + totalTaxes + shippingMethodPrice - totalDiscounts);
    expect(mockedCalculateCartTotalPrice).toHaveBeenCalledWith(lineItems);
    expect(mockedCalculateLineItemTaxes).toHaveBeenCalledWith(lineItems, taxes);
    expect(mockedCalculateTotalDiscount).toHaveBeenCalledWith(discounts);
  });
});

describe('_determineShippingAddress function', () => {
  const input = {
    billing_address_first_name: 'John',
    billing_address_last_name: 'Smith',
    billing_address_line1: '123 Smith Street',
    billing_address_line2: 'Apt A',
    billing_address_city: 'New York',
    billing_address_state: 'NY',
    billing_address_postal_code: '02445',
    billing_address_country: 'United States',
    shipping_address_first_name: 'Bob',
    shipping_address_last_name: 'Johnson',
    shipping_address_line1: '123 rue Berri',
    shipping_address_line2: 'Unit 3',
    shipping_address_city: 'Montréal',
    shipping_address_state: 'Québec',
    shipping_address_postal_code: 'H2J2R3',
    shipping_address_country: 'Canada',
  };

  test('it should use shipping address as shipping address if use_billing_address_as_shipping_address is false', () => {
    expect(
      utils._determineShippingAddress({
        ...input,
        use_billing_address_as_shipping_address: false,
      }),
    ).toEqual({
      ...input,
      use_billing_address_as_shipping_address: false,
    });
  });

  test('it should use billing address as shipping address if use_billing_address_as_shipping_address is true', () => {
    expect(
      utils._determineShippingAddress({
        ...input,
        use_billing_address_as_shipping_address: true,
      }),
    ).toEqual({
      ...input,
      use_billing_address_as_shipping_address: true,
      shipping_address_first_name: input.billing_address_first_name,
      shipping_address_last_name: input.billing_address_last_name,
      shipping_address_line1: input.billing_address_line1,
      shipping_address_line2: input.billing_address_line2,
      shipping_address_city: input.billing_address_city,
      shipping_address_state: input.billing_address_state,
      shipping_address_postal_code: input.billing_address_postal_code,
      shipping_address_country: input.billing_address_country,
    });
  });
});

describe('processCheckout function', () => {
  test('successful checkout', () => { });

  test('successful checkout with requires_ui_action', () => { });

  test('error from stripe.createPaymentMethod server response', () => { });

  test('error thrown from stripe.createPaymentMethod method', () => { });

  test('error from createOrder on our server', () => { });

  test('error from stripe.confirmCardPayment server response', () => { });

  test('error from finishOrderValidation on our server', () => { });

  test('successful = false from createOrder on our server', () => { });
});

describe('transformHydratedLineItemsToLocalLineItems function', () => {
  test('it should transform the data properly', () => {
    expect(
      utils.transformHydratedLineItemsToLocalLineItems([
        {
          id: 1,
          quantity: 5,
          foo: 'bar',
        },
        {
          id: 2,
          quantity: 3,
          basdf: 'baz',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        quantity: 5,
      },
      {
        id: 2,
        quantity: 3,
      },
    ]);
  });
});

describe('transformProductToHydratedLineItem function', () => {
  test('it should transform the product into a hydrated line item', () => {
    const product = generateMockProduct();
    const { id, name, slug, price, featured_image } = product;

    expect(utils.transformProductToHydratedLineItem(product)).toEqual({
      id,
      name,
      slug,
      price,
      featured_image,
      quantity: 1,
    });
  });
});

describe('withToast function', () => {
  test('it should provide withToast props to the passed in Component', () => {
    function MyTestComponent(props) {
      expect(props.foo).toEqual('bar');
      expect(props.addToast).not.toBe(undefined);
      expect(props.removeToast).not.toBe(undefined);
      expect(props.removeAllToasts).not.toBe(undefined);
      expect(props.updateToast).not.toBe(undefined);
      expect(props.updateToast).not.toBe(undefined);

      return null;
    }

    const ComponentWithToast = utils.withToast(MyTestComponent);

    render(
      <ToastProvider>
        <ComponentWithToast foo="bar" />
      </ToastProvider>,
    );
  });
});

describe('isValidPhoneNumber function', () => {
  test('if value is blank returns true', () => {
    expect(utils.isValidPhoneNumber('')).toEqual(true);
  });

  test.each(['514632100', '514-632-100', '514632'])('given %s as a phone number, returns false', (input) => {
    expect(utils.isValidPhoneNumber(input)).toEqual(false);
  });

  test.each([
    '+15146321003',
    '514-632-9999',
    '5146321003',
    '+1 (514) 632 - 1003',
    '+1 (514) 632-9999',
    '(514) 632-9999',
  ])('given %s as a phone number, returns true', (input) => {
    expect(utils.isValidPhoneNumber(input)).toEqual(true);
  });
});

describe('formatPhoneNumber function', () => {
  test.each([
    ['514632100', '514632100'],
    ['514-632-100', '514632100'],
    ['514632', '514632'],
  ])('given %s as an invalid phone number, returns %s', (input, expected) => {
    expect(utils.formatPhoneNumber(input)).toEqual(expected);
  });

  test.each([
    ['+15146329999', '(514) 632-9999'],
    ['514-632-9999', '(514) 632-9999'],
    ['5146329999', '(514) 632-9999'],
    ['+1 (514) 632 - 9999', '(514) 632-9999'],
    ['+1 (514) 632-9999', '(514) 632-9999'],
    ['(514) 632-9999', '(514) 632-9999'],
  ])('given %s as a phone number, returns %s', (input, expected) => {
    expect(utils.formatPhoneNumber(input)).toEqual(expected);
  });
});

describe('constructUrl function', () => {
  test('blank page and include base', () => {
    expect(utils.constructUrl({ page: '', includeBase: true })).toEqual(config.url);
  });

  test('blank page', () => {
    expect(utils.constructUrl({ page: '' })).toEqual('/');
  });

  test('include base and extra', () => {
    expect(utils.constructUrl({ page: 'foo', extra: '1234', includeBase: true })).toEqual(`${config.url}/foo/1234`);
  });

  test('include base no extra', () => {
    expect(utils.constructUrl({ page: 'foo', includeBase: true })).toEqual(`${config.url}/foo`);
  });

  test('extra', () => {
    expect(utils.constructUrl({ page: 'foo', extra: '1234' })).toEqual('/foo/1234');
  });

  test('just page', () => {
    expect(utils.constructUrl({ page: 'foo' })).toEqual('/foo');
  });
});

describe('getPagePath function', () => {
  test('it properly returns page path, without base URL or query params', () => {
    // https://stackoverflow.com/a/60697570/3902555
    delete global.window.location;
    global.window.location = new URL('https://standoutspecialties.com/foobar?jijqoijwer=asdfadf&foo=bar');

    expect(utils.getPagePath()).toEqual('/foobar');
  });
});

describe('calculatePageNumbersToShow function', () => {
  beforeAll(() => {
    config.paginationPagesToShow = 5;
  });

  test('calculate properly  when total pages is less than or equal to the configured number of pages to show', () => {
    expect(utils.calculatePageNumbersToShow(4, 58)).toEqual([1, 2, 3, 4]);
  });

  test('calculate properly when current page is less than or equal to the page numbers to show on each side of the current page', () => {
    expect(utils.calculatePageNumbersToShow(12, 2)).toEqual([1, 2, 3, 4, 5]);
  });

  test('calculate properly when approaching the last page', () => {
    expect(utils.calculatePageNumbersToShow(13, 12)).toEqual([10, 11, 12, 13]);
  });

  test('calculate properly when the current page equals the last page', () => {
    expect(utils.calculatePageNumbersToShow(12, 12)).toEqual([10, 11, 12]);
  });

  test('calculate properly a normal scenario', () => {
    expect(utils.calculatePageNumbersToShow(14, 5)).toEqual([3, 4, 5, 6, 7]);
  });
});

describe('productIsWheel function', () => {
  test('it returns true when product is wheel', () => {
    expect(utils.productIsWheel({ categories: [{ slug: 'wheels' }] })).toBe(true);
  });

  test('it returns false when product is not a wheel', () => {
    expect(utils.productIsWheel({ categories: [{ slug: 'tires' }] })).toBe(false);
  });
});
