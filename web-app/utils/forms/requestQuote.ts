import { object as YupObject, string as YupString } from 'yup';
import { yupEmail, yupPhoneNumber, yupTruck, yupTruckInitialValues } from '../../utils';

export const initialValues: Forms.Definitions.RequestQuote = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  message: '',
  ...yupTruckInitialValues,
};

export type InitialValues = typeof initialValues;

export const validationSchema = YupObject<InitialValues>({
  first_name: YupString().required('First name is required'),
  last_name: YupString().required('Last name is required'),
  email: yupEmail(),
  phone_number: yupPhoneNumber(),
  message: YupString().required('Please leave us a message'),
  ...yupTruck,
});

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'contact_information',
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
      ],
    },
    {
      id: 'truck_information',
      label: 'Truck information',
      fields: [
        {
          name: 'year',
          type: 'select',
          placeholder: 'Year',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'make',
          type: 'select',
          placeholder: 'Make',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'model',
          type: 'select',
          placeholder: 'Model',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'trim',
          type: 'select',
          placeholder: 'Trim',
          className: 'w-full sm:w-1/2',
        },
      ],
    },
    {
      id: 'message',
      label: 'Message',
      fields: [
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Please leave us a detailed message here',
          className: 'w-full',
        },
      ],
    },
  ],
  submit: {
    text: 'Submit',
    className: 'w-full',
    loadingMessage: 'Submitting',
  },
};
