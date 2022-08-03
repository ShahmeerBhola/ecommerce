import { object as YupObject, string as YupString } from 'yup';
import { yupEmail, yupPhoneNumber } from '../../utils';

export const initialValues: Forms.Definitions.Contact = {
  name: '',
  email: '',
  phone_number: '',
  message: '',
};

export type InitialValues = typeof initialValues;

export const validationSchema = YupObject<InitialValues>({
  name: YupString().required('Name is required'),
  email: yupEmail(),
  phone_number: yupPhoneNumber(false),
  message: YupString().required('Message is required'),
});

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'contact',
      fields: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name',
          className: 'w-full',
        },
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email',
          className: 'w-full',
        },
        {
          name: 'phone_number',
          type: 'tel',
          placeholder: 'Phone Number',
          className: 'w-full',
        },
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Message',
          className: 'w-full',
        },
      ],
    },
  ],
  submit: {
    text: 'Send',
    className: 'w-full',
  },
};
