import React from 'react';
import Router from 'next/router';
import { FormikHelpers } from 'formik';
import findIndex from 'lodash/findIndex';
import NProgress from 'nprogress';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { useToasts } from 'react-toast-notifications';
import Form from '../Form';
import Text from '../Text';
import WheelTirePackageDiscount from '../WheelTirePackageDiscount';
import { GrayDivider } from '../Divider';
import Price, { Props as PriceProps } from '../Price';
import Loader, { PulseLoader } from '../Loading';
import { CartContext, CartContent } from '../Cart';
import WordPressClient from '../../utils/clients/wordpress';
import * as checkoutForm from '../../utils/forms/checkout';
import {
    formatPrice,
    sendSentryEvent,
    mapObjectToSelectOptions,
    calculateDiscountTotal,
    calculateCartTotalPrice,
    calculateTotalOrderPrice,
    processCheckout,
    withToast,
    constructUrl,
    mapValuesToSelectOptions,
    transformCartToGoogleAnalyticsProducts,
    calculateTotalTaxes,
} from '../../utils';
import {
    initiateCheckout as captureInitiateCheckoutFBPixelEvent,
    completePurchase as captureCompletePurchaseFBPixelEvent,
} from '../../utils/facebookPixel';
import config from '../../config';
import { sendEnhancedEcommerceEvent } from '../../utils/googleAnalytics';

type InitialValues = checkoutForm.InitialValues;

type Props = {
    shippingCountries: StringMap;
    sellingCountries: StringMap;
    shippingStates: StringMap;
    sellingStates: StringMap;
    brandAmbassadors: WordPress.BrandAmbassador[];
};

interface FormProps extends Props {
    stripe: Stripe | null; // returns a Promise.. will be resolved before we access it
    stripeElements: StripeElements | null; // returns a Promise.. will be resolved before we access it
}

type AllFormProps = FormProps & ReturnType<typeof useToasts>;

type FormState = {
    shippingCountries: StringMap;
    sellingCountries: StringMap;
    shippingStates: StringMap;
    sellingStates: StringMap;
    brandAmbassadors: WordPress.BrandAmbassador[];
    fetchingShippingMethods: boolean;
    fetchingDiscounts: boolean;
    fetchingTaxes: boolean;
    taxes: WordPress.Tax[];
    shippingMethods: WordPress.ShippingMethod[];
    selectedShippingMethod: WordPress.ShippingMethod | null;
    discounts: WordPress.Discount[];
    stripeFieldValid: boolean;
    stripeFieldTouched: boolean;
    stripeFieldError: Forms.FormikError;
};

const PriceWithDecimal: React.FunctionComponent<PriceProps> = (props) => <Price {...props} showDecimal />;

class CheckoutForm extends React.Component<AllFormProps, FormState> {
    static contextType = CartContext;
    context!: React.ContextType<typeof CartContext>;

    constructor(props: AllFormProps) {
        super(props);
        const { shippingCountries, sellingCountries, shippingStates, sellingStates, brandAmbassadors } = props;

        captureInitiateCheckoutFBPixelEvent();

        this.state = {
            shippingCountries,
            sellingCountries,
            shippingStates,
            sellingStates,
            brandAmbassadors,
            fetchingShippingMethods: false,
            fetchingDiscounts: false,
            fetchingTaxes: false,
            taxes: [],
            shippingMethods: [],
            selectedShippingMethod: null,
            discounts: [],
            stripeFieldValid: false,
            stripeFieldTouched: false,
            stripeFieldError: null,
        };
    }

    componentDidMount(): void {
        const { lineItems, wheelTirePackages } = this.context;
        sendEnhancedEcommerceEvent(
            'begin_checkout',
            transformCartToGoogleAnalyticsProducts(lineItems, wheelTirePackages),
        );
    }

    fetchTaxes = async ({ billing_address_country, billing_address_state }: InitialValues): Promise<void> => {
        const { wheelTirePackages, lineItems } = this.context;

        if (billing_address_country && billing_address_state) {
            this.setState({ fetchingTaxes: true }, async () => {
                const data = await WordPressClient.calculateTaxes(
                    lineItems,
                    wheelTirePackages,
                    billing_address_country,
                    billing_address_state,
                );
                this.setState({ taxes: data, fetchingTaxes: false });
            });
        }
    };

    fetchShippingStates = async (country: string): Promise<void> => {
        const shippingStates = await WordPressClient.getStatesForCountry(country);
        this.setState({ shippingStates });
    };

    fetchSellingStates = async (country: string): Promise<void> => {
        const sellingStates = await WordPressClient.getStatesForCountry(country);
        this.setState({ sellingStates });
    };

    fetchShippingMethods = async (country: string, state: string): Promise<void> => {
        const { wheelTirePackages } = this.context;
        this.setState({ fetchingShippingMethods: true, selectedShippingMethod: null }, async () => {
            const shippingMethods = await WordPressClient.getShippingMethods(wheelTirePackages, country, state);
            const defaultShippingMethodIdx = findIndex(
                shippingMethods,
                ({ id }) => id === config.defaultShippingMethodId,
            );

            if (defaultShippingMethodIdx !== -1) {
                this.setState({
                    selectedShippingMethod: shippingMethods[defaultShippingMethodIdx],
                });
            }

            this.setState({ shippingMethods, fetchingShippingMethods: false });
        });
    };

    fetchDiscounts = async (shippingMethodId: string): Promise<void> => {
        const { wheelTirePackages } = this.context;
        this.setState({ fetchingDiscounts: true }, async () => {
            const discounts = await WordPressClient.getDiscounts(wheelTirePackages, shippingMethodId);
            this.setState({ discounts, fetchingDiscounts: false });
        });
    };

    onSubmitSuccess = async (orderId: number): Promise<void> => {
        captureCompletePurchaseFBPixelEvent({ currency: config.defaultCurrencyCode, value: this.totalOrderPrice });

        await Router.push({
            pathname: constructUrl({ page: 'order_confirmation' }),
            query: { order_id: orderId },
        });
        this.context.emptyCart();
    };

    onSubmitError = (
        msg: string,
        debugMsg: string,
        debugInfo: object,
        { setSubmitting }: FormikHelpers<InitialValues>,
    ): void => {
        sendSentryEvent(`Checkout onSubmitError triggered. ${debugMsg}`, debugInfo);
        this.props.addToast(msg, { appearance: 'error' });
        setSubmitting(false);
    };

    renderForm = (): JSX.Element => {
        const {
            onSubmitSuccess,
            onSubmitError,
            fetchTaxes,
            fetchDiscounts,
            fetchShippingStates,
            fetchSellingStates,
            fetchShippingMethods,
            state: {
                shippingCountries,
                sellingCountries,
                shippingStates,
                sellingStates,
                brandAmbassadors,
                fetchingShippingMethods,
                fetchingDiscounts,
                fetchingTaxes,
                shippingMethods,
                stripeFieldValid,
                stripeFieldTouched,
                stripeFieldError,
                taxes,
                selectedShippingMethod,
            },
            context: { lineItems, wheelTirePackages },
        } = this;
        const stripe = this.props.stripe as Stripe;
        const elements = this.props.stripeElements as StripeElements;
        const overriddenFields: Forms.OverriddenFields<InitialValues> = {};

        if (fetchingShippingMethods) {
            overriddenFields.shipping_method_id = (): JSX.Element => <Loader showCog={false} paddingY="py-5" />;
        }

        return (
            <Form<InitialValues>
                initialValues={checkoutForm.initialValues}
                form={checkoutForm.definition}
                validationSchema={checkoutForm.validationSchema}
                onSubmit={async (
                    formData: InitialValues,
                    formikHelpers: FormikHelpers<InitialValues>,
                ): Promise<void> => {
                    NProgress.start(); // this will either be marked as done if we error out, or when we transfer to order confirmation page
                    processCheckout({
                        formData,
                        lineItems,
                        wheelTirePackages,
                        stripe,
                        elements,
                        onSuccess: onSubmitSuccess,
                        onError: (msg: string, debugMsg: string, debugInfo: object): void => {
                            onSubmitError(msg, debugMsg, debugInfo, formikHelpers);
                            NProgress.done();
                        },
                        itemTotal: calculateCartTotalPrice(lineItems, wheelTirePackages),
                        taxTotal: calculateTotalTaxes(taxes),
                        shippingTotal: (selectedShippingMethod as WordPress.ShippingMethod).price,
                    });
                }}
                // Stripe.js has not loaded yet. Need to disable submission until it's loaded
                // Also, disable submission if price could possibly be in the process of being adjusted..
                externalDisableSubmit={
                    !stripe ||
                    !elements ||
                    !stripeFieldValid ||
                    fetchingDiscounts ||
                    fetchingShippingMethods ||
                    fetchingTaxes
                }
                fieldOptions={{
                    shipping_address_country: mapObjectToSelectOptions(shippingCountries),
                    shipping_address_state: mapObjectToSelectOptions(shippingStates),
                    billing_address_country: mapObjectToSelectOptions(sellingCountries),
                    billing_address_state: mapObjectToSelectOptions(sellingStates),
                    shipping_method_id: shippingMethods.map(({ id, title, price }) => ({
                        value: id,
                        label: `${title} - ${formatPrice(price)}`,
                    })),
                    brand_ambassador_referral: mapValuesToSelectOptions(brandAmbassadors.map(({ name }) => name)),
                }}
                onChangeHandlers={{
                    shipping_address_country: async (country: string, formValues: InitialValues): Promise<void> => {
                        const { use_billing_address_as_shipping_address, shipping_address_state } = formValues;

                        fetchShippingStates(country);

                        if (!use_billing_address_as_shipping_address && country && shipping_address_state) {
                            fetchShippingMethods(country, shipping_address_state);
                        }
                    },
                    billing_address_country: async (country: string, formValues: InitialValues): Promise<void> => {
                        const { use_billing_address_as_shipping_address, billing_address_state } = formValues;

                        fetchSellingStates(country);
                        fetchTaxes({ ...formValues, billing_address_country: country });

                        if (use_billing_address_as_shipping_address && country && billing_address_state) {
                            fetchShippingMethods(country, billing_address_state);
                        }
                    },
                    billing_address_state: async (state: string, formValues: InitialValues): Promise<void> => {
                        const { use_billing_address_as_shipping_address, billing_address_country } = formValues;

                        fetchTaxes({ ...formValues, billing_address_state: state });

                        if (use_billing_address_as_shipping_address && billing_address_country && state) {
                            fetchShippingMethods(billing_address_country, state);
                        }
                    },
                    shipping_address_state: async (state: string, formValues: InitialValues): Promise<void> => {
                        const { use_billing_address_as_shipping_address, shipping_address_country } = formValues;

                        if (!use_billing_address_as_shipping_address && shipping_address_country && state) {
                            fetchShippingMethods(shipping_address_country, state);
                        }
                    },
                    shipping_method_id: async (shippingMethodId: string): Promise<void> => {
                        fetchDiscounts(shippingMethodId);
                        const idx = findIndex(shippingMethods, (sm) => sm.id === shippingMethodId);
                        if (idx !== -1) {
                            this.setState({ selectedShippingMethod: shippingMethods[idx] });
                        }
                    },
                    use_billing_address_as_shipping_address: async (
                        useBillingAddress: boolean,
                        formValues: InitialValues,
                    ): Promise<void> => {
                        const {
                            shipping_address_country,
                            shipping_address_state,
                            billing_address_country,
                            billing_address_state,
                        } = formValues;

                        if (useBillingAddress && billing_address_country && billing_address_state) {
                            fetchShippingMethods(billing_address_country, billing_address_state);
                        } else if (!useBillingAddress && shipping_address_country && shipping_address_state) {
                            fetchShippingMethods(shipping_address_country, shipping_address_state);
                        }
                    },
                }}
                hiddenFormSectionConditions={[
                    {
                        fieldName: 'use_billing_address_as_shipping_address',
                        fieldValue: true,
                        sectionId: 'shipping_information',
                    },
                ]}
                overriddenFields={overriddenFields}
                additionalExternalSections={[
                    {
                        id: 'shipping',
                        label: 'Shipping',
                        fields: [
                            {
                                name: 'shipping_method_id',
                                type: 'radio',
                                blankOptionsFallbackText:
                                    "Shipping methods will become available once you've entered your shipping address information",
                            },
                        ],
                    },
                    {
                        id: 'payment_information',
                        label: 'Payment Information',
                        fields: [
                            {
                                name: 'cardNumber',
                                type: 'stripe',
                                placeholder: 'Credit Card Number',
                                className: 'w-full',
                                error: stripeFieldError,
                                touched: stripeFieldTouched,
                                updateError: (err: Forms.FormikError): void => {
                                    this.setState({ stripeFieldError: err });
                                },
                                updateValid: (valid: boolean): void => {
                                    this.setState({ stripeFieldValid: valid });
                                },
                                updateTouched: (touched: boolean): void => {
                                    this.setState({ stripeFieldTouched: touched });
                                },
                            },
                        ],
                    },
                ]}
            />
        );
    };

    renderPriceRow = (text: string, price: JSX.Element): JSX.Element => {
        return (
            <div className="flex items-center justify-between my-2">
                <Text>{text}</Text>
                {price}
            </div>
        );
    };

    renderShippingMethodPrice = (): JSX.Element => {
        const { selectedShippingMethod } = this.state;
        if (selectedShippingMethod) {
            return <PriceWithDecimal price={selectedShippingMethod.price} />;
        }
        return <Text>Select a shipping method</Text>;
    };

    renderTaxes = (): JSX.Element | JSX.Element[] => {
        const {
            renderPriceRow,
            state: { fetchingTaxes, taxes },
        } = this;
        if (fetchingTaxes) {
            return this.renderPriceRow('Taxes', <PulseLoader />);
        } else if (taxes.length === 0) {
            return this.renderPriceRow('Taxes', <PriceWithDecimal price={0} />);
        }
        return taxes.map(({ label, amount }) => (
            <div key={label}>{renderPriceRow(label, <PriceWithDecimal price={amount} />)}</div>
        ));
    };

    renderDiscounts = (): JSX.Element => {
        const {
            renderPriceRow,
            state: { fetchingDiscounts, discounts },
        } = this;
        if (fetchingDiscounts) {
            return <PulseLoader />;
        } else if (discounts.length === 0) {
            return this.renderPriceRow('Discounts', <PriceWithDecimal price={0} />);
        }
        return (
            <>
                {discounts.map((discount) => {
                    return renderPriceRow(
                        discount.name,
                        <PriceWithDecimal price={-calculateDiscountTotal(discount)} />,
                    );
                })}
            </>
        );
    };

    render(): JSX.Element {
        const {
            renderForm,
            renderPriceRow,
            renderTaxes,
            renderDiscounts,
            renderShippingMethodPrice,
            totalOrderPrice,
            context: { wheelTirePackages, lineItems },
        } = this;
        const baseClasses = 'w-full lg:w-1/2 h-auto lg:h-screen overflow-y-auto lg:overflow-y-scroll';

        return (
            <div className="flex flex-col-reverse lg:flex-row flex-wrap-reverse lg:flex-wrap">
                <div className={`${baseClasses} bg-white`}>
                    <div className="max-w-auto lg:max-w-512px xl:max-w-640px py-5 float-right px-5 lg:pl-0">
                        <WheelTirePackageDiscount />
                        {renderForm()}
                    </div>
                </div>
                <div className={`${baseClasses} bg-gray-50`}>
                    <div className="max-w-auto lg:max-w-512px xl:max-w-640px py-5 px-5 lg:pr-0">
                        <CartContent hideDelete hideQuantity showQuantityUnderTitle compact />
                        <div className="my-8">
                            {renderPriceRow(
                                'Order Subtotal',
                                <PriceWithDecimal price={calculateCartTotalPrice(lineItems, wheelTirePackages)} />,
                            )}
                            {renderTaxes()}
                            {renderPriceRow('Shipping Costs', renderShippingMethodPrice())}
                            {renderDiscounts()}
                            <GrayDivider />
                            {renderPriceRow('Order Total', <PriceWithDecimal price={totalOrderPrice} />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    get totalOrderPrice(): number {
        const {
            state: { taxes, selectedShippingMethod, discounts },
            context: { wheelTirePackages, lineItems },
        } = this;

        return calculateTotalOrderPrice(
            lineItems,
            wheelTirePackages,
            discounts,
            taxes,
            selectedShippingMethod?.price || 0,
        );
    }
}

const CheckoutFormWithToasts = withToast<FormProps, FormState>(CheckoutForm);

// https://stripe.com/docs/stripe-js/react#elements-provider
// https://github.com/stripe/react-stripe-js/issues/19#issuecomment-576854974
const stripe = loadStripe(config.stripe.publishableKey);

const StripeInjectedCheckoutForm: React.FunctionComponent<Props> = (props) => (
    <Elements
        stripe={stripe}
        options={{
            fonts: [
                {
                    cssSrc: 'https://fonts.googleapis.com/css2?family=Poppins:wght@500',
                },
            ],
        }}
    >
        <ElementsConsumer>
            {({ stripe, elements }): JSX.Element => (
                <CheckoutFormWithToasts stripe={stripe} stripeElements={elements} {...props} />
            )}
        </ElementsConsumer>
    </Elements>
);

export default StripeInjectedCheckoutForm;
