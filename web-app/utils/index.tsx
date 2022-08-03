import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ServerResponse } from 'http';
import { NextRouter } from 'next/router';
import { OpenGraphImages } from 'next-seo/lib/types';
import { stringify as convertObjectToQueryString } from 'qs';
import queryString from 'querystring';
import { CardElement } from '@stripe/react-stripe-js';
import { Stripe, StripeElements, PaymentMethod, PaymentIntent, StripeCardElement } from '@stripe/stripe-js';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import { captureEvent as sentryCaptureEvent } from '@sentry/node';
import { useToasts } from 'react-toast-notifications';
import { string as YupString, StringSchema as YupStringSchema } from 'yup';
import WordPressClient from './clients/wordpress';
import config from '../config';
import { ParsedUrlQuery } from 'querystring';
import {
    enhancedEcommerceLineItemListName,
    enhancedEcommerceWheelTirePackageAddOnsListName,
    enhancedEcommerceWheelTirePackageListName,
    sendEnhancedEcommercePurchaseEvent,
} from './googleAnalytics';

export const sendSentryEvent = (
    message: string,
    extra: {
        [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
): string => sentryCaptureEvent({ message, extra });

export const hasSelectedWheelQueryParam = (params: ParsedUrlQuery): boolean => 'selected_wheel' in params;

export const mapValuesToSelectOptions = (options: string[]): Forms.FieldOption[] =>
    options.map((opt) => ({ value: opt, label: opt }));

export const mapObjectToSelectOptions = (options: StringMap): Forms.FieldOption[] => {
    const data: Forms.FieldOption[] = [];

    forEach(options, (value, key) => {
        data.push({ value: key, label: value });
    });

    return data;
};

export const shouldHideFormSection = <IV,>(
    hiddenSectionConditions: Forms.HiddenFormSectionCondition<IV>[],
    values: IV,
    sectionId: string,
): boolean => {
    let hide = false;

    hiddenSectionConditions.map(({ fieldName, fieldValue, sectionId: sid }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (sectionId === sid && (values as any)[fieldName] === fieldValue) {
            hide = true;
        }
    });

    return hide;
};

export const determineProductVariationFeaturedImage = (
    product: WordPress.Product,
    selectedVariant: WordPress.ProductVariation | null,
): WordPress.Image | null => {
    let featuredImage: WordPress.Image | null;
    if (selectedVariant !== null && selectedVariant.featured_image) {
        featuredImage = selectedVariant.featured_image;
    } else {
        featuredImage = product.featured_image;
    }
    return featuredImage;
};

export const transformProductToGoogleAnalyticsProduct = ({
    sku,
    name,
    brand,
    categories,
    variant,
    price,
    list_position = 1,
    list_name = 'Search Results',
    quantity = 1,
}: GoogleAnalytics.ModifiedLineItem): GoogleAnalytics.Product => ({
    id: sku,
    name,
    brand: brand?.name,
    category: categories[0]?.name,
    variant,
    price,
    list_position,
    list_name,
    quantity,
});

export const transformProductsToGoogleAnalyticsProducts = (
    products: GoogleAnalytics.ModifiedLineItem[],
): GoogleAnalytics.Product[] => {
    return products.map((product, idx) =>
        transformProductToGoogleAnalyticsProduct({
            ...product,
            list_position: idx + 1,
        }),
    );
};

export const transformCartToGoogleAnalyticsProducts = (
    lineItems: Cart.HydratedLineItem[],
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
): GoogleAnalytics.Product[] => {
    const allProducts: GoogleAnalytics.ModifiedLineItem[] = [];

    lineItems.map((product, idx) => {
        allProducts.push({
            ...product,
            list_position: idx + 1,
            list_name: enhancedEcommerceLineItemListName,
        });
    });

    wheelTirePackages.map(({ wheel, tire, addOns }) => {
        allProducts.push({
            ...wheel,
            list_position: allProducts.length + 1,
            list_name: enhancedEcommerceWheelTirePackageListName,
        });

        allProducts.push({
            ...tire,
            list_position: allProducts.length + 1,
            list_name: enhancedEcommerceWheelTirePackageListName,
        });

        addOns.map((addOn) => {
            allProducts.push({
                ...addOn,
                list_position: allProducts.length + 1,
                list_name: enhancedEcommerceWheelTirePackageAddOnsListName,
            });
        });
    });

    return transformProductsToGoogleAnalyticsProducts(allProducts);
};

export const cartIsEmpty = (
    lineItems: Cart.HydratedLineItem[],
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
): boolean => isEmpty(lineItems) && isEmpty(wheelTirePackages);

export const numberWithCurrencyCode = (num: string, currency = config.defaultCurrencyCodeSymbol): string =>
    `${currency}${num}`;

export const convertPriceToString = (price: number): string => price.toFixed(2).toString();

export const numberWithCommas = (num: string): string => num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const calculateProductVariationPrice = (
    product: WordPress.Product,
    selectedVariant: WordPress.ProductVariation | null,
): WordPress.Prices => {
    let price: number;
    let salePrice: number;

    if (selectedVariant !== null && selectedVariant.price) {
        price = selectedVariant.price;
        salePrice = selectedVariant.sale_price;
    } else {
        price = product.price;
        salePrice = product.sale_price;
    }

    return {
        price,
        sale_price: salePrice,
    };
};

export const formatPrice = (price: number, showDecimal = false): string => {
    const numDecimals = price % 1 === 0 && !showDecimal ? 0 : 2;
    return numberWithCurrencyCode(numberWithCommas(price.toFixed(numDecimals)));
};

export const calculateCartTotalQuantity = (
    lineItems: Cart.HydratedLineItem[],
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
): number => lineItems.length + wheelTirePackages.length;

export const calculateProductPrice = ({ price, sale_price }: WordPress.Prices): number =>
    sale_price !== 0 && sale_price < price ? sale_price : price;

export const calculateWheelTirePackageAddOnsPrice = (addOns: WordPress.Prices[]): number =>
    addOns.reduce((prev, curr) => prev + calculateProductPrice(curr), 0);

export const calculateWheelTirePackagePrice = ({ wheel, tire, addOns }: Cart.WheelTirePackagePrices): number => {
    let wheelTirePackagesTotal = 0;
    wheelTirePackagesTotal += calculateProductPrice(wheel);
    wheelTirePackagesTotal += calculateProductPrice(tire);
    wheelTirePackagesTotal += calculateWheelTirePackageAddOnsPrice(addOns);
    return wheelTirePackagesTotal;
};

export const calculateWheelTirePackagesPrice = (packages: Cart.HydratedWheelTirePackage[]): number =>
    packages.reduce((prev, curr) => prev + calculateWheelTirePackagePrice(curr), 0);

export const calculateLineItemsPrice = (lineItems: Cart.HydratedLineItem[]): number =>
    lineItems.reduce((prev, curr) => prev + calculateProductPrice(curr) * curr.quantity, 0);

export const calculateCartTotalPrice = (
    lineItems: Cart.HydratedLineItem[],
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
): number => calculateLineItemsPrice(lineItems) + calculateWheelTirePackagesPrice(wheelTirePackages);

export const calculateDiscountTotal = (discount: WordPress.Discount): number => discount.amount;

export const calculateTotalTaxes = (taxes: WordPress.Tax[]): number =>
    taxes.reduce((prev, { amount }) => prev + amount, 0);

export const calculateTotalOrderPrice = (
    lineItems: Cart.HydratedLineItem[],
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
    discounts: WordPress.Discount[],
    taxes: WordPress.Tax[],
    shippingMethodPrice: number,
): number => {
    const orderTotal = calculateCartTotalPrice(lineItems, wheelTirePackages);
    const totalTaxes = calculateTotalTaxes(taxes);
    const totalDiscounts = discounts.reduce((prev, discount) => prev + calculateDiscountTotal(discount), 0);

    return orderTotal + totalTaxes + shippingMethodPrice - totalDiscounts;
};

export const _determineShippingAddress = (data: Forms.Definitions.Checkout): Forms.Definitions.Checkout => {
    if (data.use_billing_address_as_shipping_address) {
        data = {
            ...data,
            shipping_address_first_name: data.billing_address_first_name,
            shipping_address_last_name: data.billing_address_last_name,
            shipping_address_line1: data.billing_address_line1,
            shipping_address_line2: data.billing_address_line2,
            shipping_address_city: data.billing_address_city,
            shipping_address_state: data.billing_address_state,
            shipping_address_postal_code: data.billing_address_postal_code,
            shipping_address_country: data.billing_address_country,
        };
    }
    return data;
};

export const processCheckout = async ({
    formData,
    lineItems,
    wheelTirePackages,
    stripe,
    elements,
    onSuccess,
    onError,
    itemTotal,
    taxTotal,
    shippingTotal,
}: {
    formData: Forms.Definitions.Checkout;
    lineItems: Cart.HydratedLineItem[];
    wheelTirePackages: Cart.HydratedWheelTirePackage[];
    stripe: Stripe;
    elements: StripeElements;
    onSuccess: (orderId: number) => Promise<void>;
    onError: (toastMsg: string, debugMsg: string, debugInfo: object) => void;
    itemTotal: number;
    taxTotal: number;
    shippingTotal: number;
}): Promise<void> => {
    const defaultErrorMessage = 'There was an issue processing your order. Please try again.';
    const cardIssueMessage = 'There was an issue with your card. Please try again.';
    const errorBaseInfo = { formData, cart: lineItems };
    const data = _determineShippingAddress(formData);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement) as StripeCardElement,
        billing_details: {
            address: {
                line1: data.billing_address_line1,
                line2: data.billing_address_line2,
                city: data.billing_address_city,
                state: data.billing_address_state,
                postal_code: data.billing_address_postal_code,
                country: data.billing_address_country,
            },
            email: data.email,
            name: `${data.billing_address_first_name} ${data.billing_address_last_name}`,
            phone: data.phone_number,
        },
    });

    if (error) {
        // Something didn't go as expected while creating the PaymentMethod with Stripe
        onError(defaultErrorMessage, 'Error while creating the PaymentMethod with Stripe', {
            formData: data,
            cart: lineItems,
            stripeCreatePaymentMethodResponse: {
                error,
                paymentMethod,
            },
        });
    } else {
        // Everything was okay creating the PaymentMethod, contact our server to complete the transaction
        const paymentMethodId = (paymentMethod as PaymentMethod).id;
        const { order_id, requires_ui_action, internal_message, successful } = await WordPressClient.createOrder(
            paymentMethodId,
            lineItems,
            wheelTirePackages,
            data,
        );
        const orderId = order_id as number;

        if (requires_ui_action) {
            // https://stripe.com/docs/payments/accept-a-payment-synchronously#web-handle-next-actions
            try {
                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    requires_ui_action.payment_intent_client_secret,
                    {
                        payment_method: paymentMethodId,
                        shipping: {
                            address: {
                                line1: data.shipping_address_line1,
                                line2: data.shipping_address_line2,
                                city: data.shipping_address_city,
                                state: data.shipping_address_state,
                                postal_code: data.shipping_address_postal_code,
                                country: data.shipping_address_country,
                            },
                            name: `${data.shipping_address_first_name} ${data.shipping_address_last_name}`,
                            phone: data.phone_number,
                        },
                    },
                );

                if (error) {
                    // Something went wrong during the manual UI verification process..
                    onError(cardIssueMessage, 'Error from Stripe during the manual UI verification process.', {
                        ...errorBaseInfo,
                        requires_ui_action,
                        orderId,
                        paymentMethodId,
                        stripeconfirmCardPaymentResponse: {
                            error,
                            paymentIntent,
                        },
                    });
                } else {
                    // Manual verification is done, contact our server to finalize the process
                    const paymentIntentId = (paymentIntent as PaymentIntent).id;
                    const { successful: validationSuccessful } = await WordPressClient.finishOrderValidation(
                        paymentIntentId,
                        orderId,
                    );
                    if (!validationSuccessful) {
                        // Something didn't go as expected during the manual validation process
                        onError(cardIssueMessage, 'Error from our server during the manual UI verification process', {
                            ...errorBaseInfo,
                            requires_ui_action,
                            orderId,
                            paymentMethodId,
                            stripeconfirmCardPaymentResponse: {
                                error,
                                paymentIntent,
                            },
                            validationSuccessful,
                        });
                    } else {
                        await onSuccess(orderId);
                    }
                }
            } catch (err) {
                // This handles the case where handleCardAction fails
                // I did come across an error like this once.. IntegrationError: handleCardAction: The PaymentIntent supplied does not require manual server-side confirmation. Please use confirmCardPayment instead to complete the payment.
                // Not really sure why it was triggered tbh
                onError(cardIssueMessage, 'Error during confirmCardPayment', {
                    ...errorBaseInfo,
                    requires_ui_action,
                    orderId,
                    paymentMethodId,
                });
            }
        } else if (!successful) {
            // Something didn't go as expected on the server
            onError(internal_message, 'Error from our server when calling createOrder endpoint', {
                ...errorBaseInfo,
                requires_ui_action,
                orderId,
                paymentMethodId,
                successful,
            });
        } else {
            sendEnhancedEcommercePurchaseEvent({
                transaction_id: orderId.toString(),
                affiliation: 'Standout Specialties Web App',
                currency: config.defaultCurrencyCode,
                value: itemTotal,
                tax: taxTotal,
                shipping: shippingTotal,
                items: transformCartToGoogleAnalyticsProducts(lineItems, wheelTirePackages),
            });
            await onSuccess(orderId);
        }
    }
};

export const transformHydratedLineItemsToLocalLineItems = (lineItems: Cart.HydratedLineItem[]): Cart.BaseLineItem[] =>
    lineItems.map(({ quantity, id, truck }) => ({ quantity, id, truck }));

const transformHydratedWheelTirePackageToLocalWheelTirePackage = ({
    wheel,
    tire,
    addOns,
    ...rest
}: Cart.HydratedWheelTirePackage): Cart.LocalWheelTirePackage => ({
    ...rest,
    wheel: wheel.id,
    tire: tire.id,
    addOns: addOns.map(({ id }) => id),
});

export const transformHydratedWheelTirePackagesToLocalWheelTirePackages = (
    wheelTirePackages: Cart.HydratedWheelTirePackage[],
): Cart.LocalWheelTirePackage[] => wheelTirePackages.map(transformHydratedWheelTirePackageToLocalWheelTirePackage);

export const transformProductToHydratedLineItem = (
    {
        id,
        sku,
        name,
        slug,
        price,
        sale_price,
        featured_image,
        metadata,
        brand,
        categories,
        quantity_sold_in,
        sold_as_truck_set,
        attributes,
        parent,
    }: WordPress.ProductBase & { attributes?: StringMap; parent?: WordPress.Product },
    truck: Truck.LocalOrNull = null,
): Cart.HydratedLineItem => ({
    id,
    sku,
    name,
    slug,
    price,
    sale_price,
    featured_image,
    metadata,
    brand,
    categories,
    quantity: 1,
    quantity_sold_in,
    sold_as_truck_set,
    truck,
    attributes,
    parent,
});

export const transformTruckToLocalTruck = ({ add_spare, ...rest }: Truck.API): Truck.Local => ({
    addSpare: add_spare,
    ...rest,
});

export const transformLocalTruckToAPITruck = ({ addSpare, ...rest }: Truck.Local): Truck.API => ({
    add_spare: addSpare,
    ...rest,
});

export const transformWheelTirePackageToToHydratedWheelTirePackage = ({
    tire,
    wheel,
    add_ons,
    truck,
}: Cart.WheelTirePackageHydrateResponse): Cart.HydratedWheelTirePackage => ({
    tire: transformProductToHydratedLineItem(tire),
    wheel: transformProductToHydratedLineItem(wheel),
    truck: transformTruckToLocalTruck(truck),
    addOns: add_ons.map((addOn) => transformProductToHydratedLineItem(addOn)),
});

// https://github.com/jossmac/react-toast-notifications/issues/98
export const withToast = <Props, State>(
    Component: React.ComponentClass<Props & ReturnType<typeof useToasts>, State>,
): React.FunctionComponent<Props> => {
    return function WrappedComponent(props: Props): React.ReactElement<Props> {
        const toastFuncs = useToasts();
        return <Component {...props} {...toastFuncs} />;
    };
};

export const formatPhoneNumber = (value: string): string => {
    // https://stackoverflow.com/a/30058928/3902555

    // Strip all characters from the input except digits
    let input = value.replace(/\D/g, '');

    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0, 10);

    // Based upon the length of the string, we add formatting as necessary
    const size = input.length;
    if (size == 0) {
        input = input;
    } else if (size < 4) {
        input = '(' + input;
    } else if (size < 7) {
        input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6);
    } else {
        input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6) + '-' + input.substring(6, 10);
    }
    return input;
};

export const isValidPhoneNumber = (value: string): boolean => {
    // https://stackoverflow.com/a/4339299/3902555
    const match = value.match(/\d/g);
    return match !== null ? match.length === 10 : false;
};

export const constructUrl = ({ page, includeBase = false, extra, queryParams }: Pages.UrlConstruct): string => {
    let url: string;

    if (page === '' && includeBase) {
        url = config.url;
    } else if (page === '') {
        url = '/';
    } else if (includeBase && extra) {
        url = `${config.url}/${page}/${extra}`;
    } else if (includeBase) {
        url = `${config.url}/${page}`;
    } else if (extra) {
        url = `/${page}/${extra}`;
    } else {
        url = `/${page}`;
    }

    if (!isEmpty(queryParams)) {
        url += `?${convertObjectToQueryString(queryParams)}`;
    }

    return url;
};

export const constructProductUrl = ({
    slug,
    queryParams = {},
    includeBase = false,
}: {
    slug: string;
    queryParams?: StringMap;
    includeBase?: boolean;
}): string => constructUrl({ page: 'product', extra: slug, includeBase, queryParams });

export const getPagePath = (): string => {
    // https://stackoverflow.com/a/25203231/3902555
    // https://stackoverflow.com/a/5817559/3902555
    const { location } = window;
    const { search, host, protocol } = location;
    return location.toString().replace(search, '').replace(`${protocol}//${host}`, '');
};

export const calculatePageNumbersToShow = (totalPages: number, currentPage: number): number[] => {
    const pageNumbersToShow = config.paginationPagesToShow;
    const pageNumbersToShowOnEachSideOfCurrentPage = 2;

    if (totalPages <= pageNumbersToShow) {
        return [...range(1, totalPages + 1)];
    } else if (currentPage <= pageNumbersToShowOnEachSideOfCurrentPage) {
        return [...range(1, pageNumbersToShow + 1)];
    } else if (currentPage < totalPages && currentPage > totalPages - pageNumbersToShowOnEachSideOfCurrentPage) {
        // approaching the last page..
        return [
            ...range(currentPage - pageNumbersToShowOnEachSideOfCurrentPage, currentPage),
            currentPage,
            ...range(currentPage + 1, totalPages - pageNumbersToShowOnEachSideOfCurrentPage + 1),
        ];
    } else if (currentPage === totalPages) {
        // last page
        return [...range(currentPage - pageNumbersToShowOnEachSideOfCurrentPage, currentPage), currentPage];
    }

    return [
        ...range(currentPage - pageNumbersToShowOnEachSideOfCurrentPage, currentPage),
        currentPage,
        ...range(currentPage + 1, currentPage + pageNumbersToShowOnEachSideOfCurrentPage + 1),
    ];
};

export const getQueryParams = (router: NextRouter): StringMap => {
    const { query } = router;
    delete query.slug;
    return query as StringMap;
};

export const getQueryParamsWithoutRouter = (): ParsedUrlQuery => {
    return queryString.parse(window.location.search.replace('?', ''));
};

export const modifyQueryParam = (router: NextRouter, queryKey: string, value: string | null): void => {
    const query = getQueryParams(router);

    if (value === null) {
        delete query[queryKey];
    } else {
        query[queryKey] = value;
    }

    router.push({ pathname: getPagePath(), query });
};

export const clearAllQueryParams = (router: NextRouter): void => {
    router.push({ pathname: getPagePath(), query: {} });
};

type CatOrEmpty = WordPress.ProductCategory | {};

const _categoryIsType = (category: CatOrEmpty, type: string): boolean => {
    if (isEmpty(category)) {
        return false;
    }
    return (category as WordPress.ProductCategory).slug === type;
};

export const categoryIsWheel = (cat: CatOrEmpty): boolean => _categoryIsType(cat, config.categorySlugs.wheels);

export const categoryIsTire = (cat: CatOrEmpty): boolean => _categoryIsType(cat, config.categorySlugs.tires);

export const categoryIsWheelAccessory = (cat: CatOrEmpty): boolean =>
    _categoryIsType(cat, config.categorySlugs.wheelAccessories);

export const categoryIsSuspension = (cat: CatOrEmpty): boolean => _categoryIsType(cat, config.categorySlugs.suspension);

export const categoryIsApparel = (cat: CatOrEmpty): boolean => _categoryIsType(cat, config.categorySlugs.apparel);

export const categoryIsLedLighting = (cat: CatOrEmpty): boolean =>
    _categoryIsType(cat, config.categorySlugs.ledLighting);

export const categoryIsWheelsAndTires = (cat: CatOrEmpty): boolean =>
    _categoryIsType(cat, config.categorySlugs.wheelsAndTires);

const _productIsCategory = (
    categories: WordPress.ProductCategory[],
    predicate: (cat: CatOrEmpty) => boolean,
): boolean => {
    for (let i = 0; i < categories.length; i++) {
        if (predicate(categories[i])) {
            return true;
        }
    }
    return false;
};

export const productIsWheel = (categories: WordPress.ProductCategory[]): boolean =>
    _productIsCategory(categories, categoryIsWheel);

export const productIsTire = (categories: WordPress.ProductCategory[]): boolean =>
    _productIsCategory(categories, categoryIsTire);

export const productIsApparel = (categories: WordPress.ProductCategory[]): boolean =>
    _productIsCategory(categories, categoryIsApparel);

export const productIsSuspension = (categories: WordPress.ProductCategory[]): boolean =>
    _productIsCategory(categories, categoryIsSuspension);

export const productHasVariations = ({ variations }: WordPress.Product): boolean => !isEmpty(variations);

export const constructWheelDimension = ({ Diameter, Width, Offset }: WordPress.WheelMetadata): string => {
    if (Diameter && Width) {
        return `${Diameter}x${Width}${Offset ? ` ${Offset}` : ''}`;
    }
    return '';
};

export const constructTireDimension = (tire: WordPress.TireMetadata): string =>
    `${tire.Height || ''}/${tire.Width || ''}R${tire['Wheel Size']}`;

export const constructTruckTitle = ({ year, make, model, trim }: Truck.Local): string =>
    `${year} ${make} ${model} ${trim}`;

export const constructSuspensionRange = (data: WordPress.SuspensionMetadata): string =>
    `${data['Vehicle Year']} ${data['Vehicle Make']} ${data['Vehicle Drive']}`;

// https://stackoverflow.com/a/196991/3902555
export const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const fetchAddSpareFromParams = (params: ParsedUrlQuery): string => params.add_spare as string;

export const fetchSelectedWheelFromParams = (params: ParsedUrlQuery): string => params.selected_wheel as string;

export const getAddSpareQueryParam = (): string => fetchAddSpareFromParams(getQueryParamsWithoutRouter());

const isQueryParamTruthy = (param: string): boolean => param === 'true';

export const isAddSpareQueryParamTruthy = (): boolean =>
    isQueryParamTruthy(fetchAddSpareFromParams(getQueryParamsWithoutRouter()));

export const getTruckQueryParams = ({ year, make, model, trim, add_spare }: StringMap): Truck.Local => ({
    year,
    make,
    model,
    trim,
    addSpare: isQueryParamTruthy(add_spare),
});

export const addSpareIsRelevant = (query: ParsedUrlQuery): boolean => hasSelectedWheelQueryParam(query);

const addSpareIsRelevantAndTrueInParams = (params: ParsedUrlQuery): boolean =>
    addSpareIsRelevant(params) && isQueryParamTruthy(fetchAddSpareFromParams(params));

export const calculateSoldAsQuantityText = (
    quantitySoldIn: number,
    soldAsTruckSet: boolean,
    addSpare: boolean,
): string => {
    if (soldAsTruckSet) {
        return 'Set for Four Wheels';
    }

    if (quantitySoldIn !== 4) {
        return 'Single Unit';
    }

    let text = 'Set of Four';
    if (addSpare) {
        text += ' + Spare';
    }

    return text;
};

export const calculateSoldAsQuantityTextFromParams = (
    quantitySoldIn: number,
    soldAsTruckSet: boolean,
    params: ParsedUrlQuery,
): string => calculateSoldAsQuantityText(quantitySoldIn, soldAsTruckSet, addSpareIsRelevantAndTrueInParams(params));

type MinMaxPrices = {
    min: number;
    max: number;
};

const findVariationsMinMaxPrices = (variations: WordPress.ProductVariation[]): MinMaxPrices => {
    let min = 0;
    let max = 0;

    variations.map(({ price }) => {
        if (min === 0 || price < min) {
            min = price;
        }
        if (price > max) {
            max = price;
        }
    });

    return { min, max };
};

export const productHasPriceRange = (variations: WordPress.ProductVariation[]): boolean => {
    if (variations.length === 0) {
        return false;
    }
    const { min, max } = findVariationsMinMaxPrices(variations);
    return min !== max;
};

export const formatVariationsPrice = (variations: WordPress.ProductVariation[]): string => {
    const { min, max } = findVariationsMinMaxPrices(variations);

    if (min === max) {
        return formatPrice(max);
    }
    return `${formatPrice(min)} - ${formatPrice(max)}`;
};

export const fetchWheelFilters = async (): Promise<Search.Filter<API.WheelSearchArgs>[]> => {
    const {
        diameters,
        widths,
        offsets,
        bolt_patterns,
        colors,
        brands,
        forged,
    } = await WordPressClient.getWheelFilterValues();
    return [
        {
            queryKey: 'diameter',
            placeholder: 'Diameter',
            options: diameters,
        },
        {
            queryKey: 'width',
            placeholder: 'Width',
            options: widths,
        },
        {
            queryKey: 'bolt_pattern',
            placeholder: 'Bolt Pattern',
            options: bolt_patterns,
        },
        {
            queryKey: 'color',
            placeholder: 'Color',
            options: colors,
        },
        {
            queryKey: 'offset',
            placeholder: 'Offset',
            options: offsets,
        },
        {
            queryKey: 'brand',
            placeholder: 'Brand',
            options: brands,
        },
        {
            queryKey: 'forged',
            placeholder: 'Forged',
            options: forged,
        },
    ];
};

export const fetchTireFilters = async (): Promise<Search.Filter<API.TireSearchArgs>[]> => {
    const {
        diameters,
        heights,
        widths,
        max_pressures,
        max_loads,
        load_ranges,
        brands,
    } = await WordPressClient.getTireFilterValues();
    return [
        {
            queryKey: 'wheel_size',
            placeholder: 'Diameter',
            options: diameters,
        },
        {
            queryKey: 'height',
            placeholder: 'Height',
            options: heights,
        },
        {
            queryKey: 'width',
            placeholder: 'Width',
            options: widths,
        },
        {
            queryKey: 'max_pressure',
            placeholder: 'Max Pressure',
            options: max_pressures,
        },
        {
            queryKey: 'max_load',
            placeholder: 'Max Load',
            options: max_loads,
        },
        {
            queryKey: 'load_range',
            placeholder: 'Load Range',
            options: load_ranges,
        },
        {
            queryKey: 'brand',
            placeholder: 'Brand',
            options: brands,
        },
    ];
};

export const fetchDefaultFilters = async (catSlug: string): Promise<Search.Filter[]> => {
    const { brands } = await WordPressClient.getOtherCategoryFilterValues(catSlug);
    return [
        {
            queryKey: 'brand',
            placeholder: 'Brand',
            options: brands,
        },
    ];
};

export const fetchFiltersBasedOnCategory = async (
    category: WordPress.ProductCategory | {},
): Promise<Search.Filter[]> => {
    let filters: Search.Filter[] = [];

    if (!isEmpty(category)) {
        const cat = category as WordPress.ProductCategory;
        if (categoryIsWheel(cat)) {
            filters = await fetchWheelFilters();
        } else if (categoryIsTire(cat)) {
            filters = await fetchTireFilters();
        } else {
            filters = await fetchDefaultFilters(cat.name);
        }
    }

    return filters;
};

export const sortFieldOptions = (fields: Forms.FieldOption[]): Forms.FieldOption[] => {
    // https://stackoverflow.com/questions/2802341/javascript-natural-sort-of-alphanumerical-strings
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    return fields.sort((a, b) => collator.compare(a.label, b.label));
};

export const sortDropdownOptions = (options: string[]): string[] => {
    // https://stackoverflow.com/questions/2802341/javascript-natural-sort-of-alphanumerical-strings
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    return options.sort((a, b) => collator.compare(a, b));
};

export const yupPhoneNumber = (required = true): YupStringSchema<string> => {
    const phoneNumber = YupString<string>().test('phone-number', 'Not a valid phone number', (val) => {
        return val === null || val === undefined ? false : isValidPhoneNumber(val);
    });
    return required ? phoneNumber.required('Phone number is required') : phoneNumber.defined();
};

export const yupEmail = (): YupStringSchema<string> =>
    YupString().email('Not a valid email').required('Email is required');

export const yupTruckInitialValues = {
    year: '',
    make: '',
    model: '',
    trim: '',
};

export const yupTruck = {
    year: YupString().required('Year is required'),
    make: YupString().required('Make is required'),
    model: YupString().required('Model is required'),
    trim: YupString().required('Trim is required'),
};

const _determineOpenGraphImage = (image: WordPress.Image | null): ReadonlyArray<OpenGraphImages> => {
    if (image?.src) {
        return [
            {
                url: image.src,
                alt: image.alt,
            },
        ];
    }
    return [];
};

export const determineBrandOpenGraphImage = ({ image }: WordPress.ProductBrand): ReadonlyArray<OpenGraphImages> =>
    _determineOpenGraphImage(image);

export const determineCategoryOpenGraphImage = ({ image }: WordPress.ProductCategory): ReadonlyArray<OpenGraphImages> =>
    _determineOpenGraphImage(image);

export const checkOutLargeSelectionText = (noun: string): string => `Check out our large selection of ${noun}`;

export const constructCanonicalUrl = (props: Omit<Pages.UrlConstruct, 'includeBase'>): string =>
    constructUrl({ ...props, includeBase: true });

export const constructCategoryOpenGraphUrl = (extra: string): string =>
    constructCanonicalUrl({ page: 'category', extra });

export const useWindowSize = (): WindowSizeHookProps => {
    // https://usehooks.com/useWindowSize/
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/

    const [windowSize, setWindowSize] = useState<WindowSizeHookProps>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        const handleResize = (): void => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return (): void => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

export const serverSideRedirect = (url: string, res: ServerResponse): void => {
    res.writeHead(301, { Location: url });
    res.end();
};

export const shouldRedirectSearchToSingleProductPage = (products: WordPress.Product[], res: ServerResponse): void => {
    if (products.length === 1) {
        // only one matching result, redirect directly to that product page
        serverSideRedirect(constructProductUrl({ slug: products[0].slug }), res);
    }
};

export const stringToArray = (str: string | string[]): string[] => (Array.isArray(str) ? str : [str]);

export const isServer = (): boolean => typeof window === 'undefined';

export const useSafeLayoutEffect = isServer() ? useEffect : useLayoutEffect;

export const useMediaQuery = (query: string | string[]): boolean[] => {
    const queries = stringToArray(query);
    const isSupported = !isServer() && 'matchMedia' in window;

    const [matches, setMatches] = useState(
        queries.map((_query) => (isSupported ? !!window.matchMedia(_query).matches : false)),
    );

    useSafeLayoutEffect(() => {
        if (!isSupported) return undefined;

        const mediaQueryList = queries.map((_query) => window.matchMedia(_query));

        const listenerList = mediaQueryList.map((mediaQuery, index) => {
            const listener = (): void => {
                setMatches((prev) => prev.map((prevValue, idx) => (index === idx ? !!mediaQuery.matches : prevValue)));
            };

            mediaQuery.addEventListener('change', listener);

            return listener;
        });

        return (): void => {
            mediaQueryList.forEach((mediaQuery, index) => {
                mediaQuery.removeEventListener('change', listenerList[index]);
            });
        };
    }, [query]);

    return matches;
};

export const isBrowserSide = (): boolean => typeof window !== 'undefined';

export const useOnClickOutside = (ref: React.RefObject<HTMLDivElement | null>, handler: (e: any) => void): void => {
    useEffect(() => {
        const listener = (event: any): void => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return (): void => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};
