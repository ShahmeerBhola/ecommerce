import { object as YupObject, string as YupString, boolean as YupBoolean, Schema as YupSchema } from 'yup';
import { yupEmail, yupPhoneNumber } from '../../utils';
import config from '../../config';

const { defaultCountryCode, defaultShippingMethodId } = config;

export const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  billing_address_first_name: '',
  billing_address_last_name: '',
  billing_address_line1: '',
  billing_address_line2: '',
  billing_address_city: '',
  billing_address_state: '',
  billing_address_postal_code: '',
  billing_address_country: defaultCountryCode,
  use_billing_address_as_shipping_address: false,
  signup_for_newsletter: true,
  shipping_method_id: defaultShippingMethodId,
  shipping_address_first_name: '',
  shipping_address_last_name: '',
  shipping_address_line1: '',
  shipping_address_line2: '',
  shipping_address_city: '',
  shipping_address_state: '',
  shipping_address_postal_code: '',
  shipping_address_country: defaultCountryCode,
  brand_ambassador_referral: '',
};

export type InitialValues = typeof initialValues;

const conditionalShippingField = (label: string): YupSchema<string> =>
  YupString<string>().when('use_billing_address_as_shipping_address', {
    is: true,
    then: YupString(),
    otherwise: YupString().required(`${label} is required`),
  });

export const validationSchema = YupObject<InitialValues>({
  first_name: YupString().required('First name is required'),
  last_name: YupString().required('Last name is required'),
  email: yupEmail(),
  phone_number: yupPhoneNumber(),
  billing_address_first_name: YupString().required('First name is required'),
  billing_address_last_name: YupString().required('Last name is required'),
  billing_address_line1: YupString().required('Address line 1 is required'),
  billing_address_line2: YupString(),
  billing_address_city: YupString().required('City is required'),
  billing_address_state: YupString().required('State is required'),
  billing_address_postal_code: YupString().required('Postal code is required'),
  billing_address_country: YupString().required('Country is required'),
  use_billing_address_as_shipping_address: YupBoolean(),
  signup_for_newsletter: YupBoolean(),
  shipping_method_id: YupString().required('Shipping method is required'),
  shipping_address_first_name: conditionalShippingField('First name'),
  shipping_address_last_name: conditionalShippingField('Last name'),
  shipping_address_line1: conditionalShippingField('Address line 1'),
  shipping_address_line2: YupString(),
  shipping_address_city: conditionalShippingField('City'),
  shipping_address_state: conditionalShippingField('State'),
  shipping_address_postal_code: conditionalShippingField('Postal code'),
  shipping_address_country: conditionalShippingField('Country'),
  brand_ambassador_referral: YupString(),
});

const contactInfoMargin = 'mb-8';
const yMargin = 'my-8';

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'contact_information',
      yMargin: contactInfoMargin,
      label: 'Contact Information',
      fields: [
        {
          name: 'first_name',
          type: 'text',
          placeholder: 'First Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'last_name',
          type: 'text',
          placeholder: 'Last Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'phone_number',
          type: 'tel',
          placeholder: 'Phone Number',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'brand_ambassador_referral',
          type: 'select',
          placeholder: 'Who referred you? (Optional)',
          className: 'w-full',
        },
        {
          name: 'signup_for_newsletter',
          type: 'checkbox',
          placeholder: 'Keep me up to date on news and exclusive offers (+1 entry into the giveaway)',
          className: 'w-full',
        },
      ],
    },
    {
      id: 'billing_information',
      yMargin,
      label: 'Billing information',
      fields: [
        {
          name: 'billing_address_first_name',
          type: 'text',
          placeholder: 'First Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_last_name',
          type: 'text',
          placeholder: 'Last Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_line1',
          type: 'text',
          placeholder: 'Address Line 1',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_line2',
          type: 'text',
          placeholder: 'Address Line 2',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_city',
          type: 'text',
          placeholder: 'City',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_state',
          type: 'select',
          placeholder: 'State',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_postal_code',
          type: 'text',
          placeholder: 'Postal Code',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'billing_address_country',
          type: 'select',
          placeholder: 'Country',
          className: 'w-full sm:w-1/2',
        },
      ],
    },
    {
      id: 'use_billing_address_as_shipping_address',
      yMargin,
      fields: [
        {
          name: 'use_billing_address_as_shipping_address',
          type: 'checkbox',
          placeholder: 'Use billing address as shipping address?',
          className: 'w-full',
        },
      ],
    },
    {
      id: 'shipping_information',
      yMargin,
      label: 'Shipping information',
      fields: [
        {
          name: 'shipping_address_first_name',
          type: 'text',
          placeholder: 'First Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_last_name',
          type: 'text',
          placeholder: 'Last Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_line1',
          type: 'text',
          placeholder: 'Address Line 1',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_line2',
          type: 'text',
          placeholder: 'Address Line 2',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_city',
          type: 'text',
          placeholder: 'City',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_state',
          type: 'select',
          placeholder: 'State',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_postal_code',
          type: 'text',
          placeholder: 'Postal Code',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'shipping_address_country',
          type: 'select',
          placeholder: 'Country',
          className: 'w-full sm:w-1/2',
        },
      ],
    },
  ],
  submit: {
    text: 'Submit',
    className: 'w-full',
    loadingMessage: 'Processing Order',
  },
  renderSubmitInsideSections: false,
};
