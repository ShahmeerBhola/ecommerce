import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { Field, FieldProps } from 'formik';

import { formatPhoneNumber } from '../../utils';

import Select from './Select';
import Input from './Input';
import InputGroup from './InputGroup';
import CreditCardLogos from '../CreditCardLogos';

import './stripe_card_element.scss';

type StripeCallbackProps = {
    error: Forms.FormikError;
    touched: boolean;
    updateError: (err: Forms.FormikError) => void;
    updateValid: (valid: boolean) => void;
    updateTouched: (touched: boolean) => void;
};

interface Props<IV> extends Partial<StripeCallbackProps> {
    name: string;
    type: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    noXPadding?: boolean;
    overrideContent?: () => JSX.Element;
    blankOptionsFallbackText?: string;
    onChange?: Forms.ChangeHandler<IV>;
    onBlur?: Forms.ChangeHandler<IV>;
    fieldOptions?: Forms.FieldOption[];
}

const SOSField = <IV,>({
    name,
    type,
    placeholder,
    className,
    onChange,
    onBlur,
    noXPadding,
    fieldOptions,
    disabled,
    overrideContent,
    blankOptionsFallbackText,
    ...rest
}: Props<IV>): JSX.Element => {
    return (
        <Field name={name}>
            {({
                field: { name, value: fieldValue },
                form: { handleBlur, setFieldValue, values },
                meta: { error, touched },
            }: FieldProps<IV>): JSX.Element => {
                const borderColor = error && touched ? 'border-red-200' : 'border-gray-901';

                const value = fieldValue as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                const onChangeWrapper = (e: Forms.ChangeEvent): void => {
                    let newValue: any = e.currentTarget.value; // eslint-disable-line @typescript-eslint/no-explicit-any

                    // Do any normalization here..
                    if (type === 'tel') {
                        newValue = formatPhoneNumber(newValue);
                    } else if (type === 'checkbox') {
                        newValue = (e as React.ChangeEvent<HTMLInputElement>).currentTarget.checked;
                    }

                    setFieldValue(name, newValue);
                    onChange && onChange(newValue, values);
                };

                const onBlurWrapper = (e: Forms.FocusEvent): void => {
                    let newValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any

                    if (type === 'checkbox') {
                        newValue = (e as React.ChangeEvent<HTMLInputElement>).currentTarget.checked;
                    } else {
                        newValue = e.currentTarget.value;
                    }

                    handleBlur(e);
                    onBlur && onBlur(newValue, values);
                };

                if (type === 'select') {
                    return (
                        <InputGroup error={error} touched={touched} className={className} noXPadding={noXPadding}>
                            <Select
                                name={name}
                                value={value}
                                placeholder={placeholder}
                                disabled={disabled}
                                onChange={onChangeWrapper}
                                onBlur={onBlurWrapper}
                                options={fieldOptions as Forms.FieldOption[]}
                            />
                        </InputGroup>
                    );
                } else if (type === 'stripe') {
                    // The reason why we have to have error, touched, updateError, updateTouched
                    // and updateValid is that the Stripe CardElement component does not expose its value
                    // therefore it would be impossible to do form validation on this field (ex. requiring that the
                    // field has a value). Instead we store the state for this field, error and touched, outside
                    // of our form and pass it all the way down to the field. The three update methods simply
                    // update that state
                    const {
                        error: stripeError,
                        touched: stripeTouched,
                        updateError,
                        updateTouched,
                        updateValid,
                    } = rest as StripeCallbackProps;
                    const stripeRed = 'rgb(242, 57, 57)';
                    const stripeGray = 'rgb(124, 129, 134)';

                    return (
                        <InputGroup
                            error={stripeError}
                            touched={stripeTouched}
                            className={className}
                            noXPadding={noXPadding}
                        >
                            <CardElement
                                className={`sos-stripe-card-element${stripeError !== null ? ' error' : ''}`}
                                options={{
                                    hidePostalCode: true,
                                    style: {
                                        base: {
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '16px',
                                            color: stripeGray,
                                            '::placeholder': {
                                                color: stripeGray,
                                            },
                                        },
                                        invalid: {
                                            color: stripeRed,
                                        },
                                    },
                                }}
                                onChange={({ error, complete }): void => {
                                    updateTouched(true);

                                    if (error?.message) {
                                        updateValid(false);
                                        updateError(error.message);
                                    } else {
                                        updateError(null);
                                    }

                                    if (!error && complete) {
                                        updateValid(true);
                                    }
                                }}
                            />
                            <CreditCardLogos height="h-30px" className="mt-3" />
                        </InputGroup>
                    );
                }

                return (
                    <InputGroup error={error} touched={touched} className={className} noXPadding={noXPadding}>
                        <Input
                            name={name}
                            type={type}
                            value={value}
                            disabled={disabled}
                            overrideContent={overrideContent}
                            borderColor={borderColor}
                            placeholder={placeholder}
                            onChange={onChangeWrapper}
                            onBlur={onBlurWrapper}
                            blankOptionsFallbackText={blankOptionsFallbackText}
                            options={fieldOptions}
                        />
                    </InputGroup>
                );
            }}
        </Field>
    );
};

export default SOSField;
