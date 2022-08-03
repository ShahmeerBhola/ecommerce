import { object as YupObject } from 'yup';
import { yupEmail } from '..';

export const initialValues: Forms.Definitions.NewsletterSignup = { email: '' };
export type InitialValues = typeof initialValues;
export const validationSchema = YupObject<InitialValues>({ email: yupEmail() });

export const definition = (emailClassName: string, submitClassName: string): Forms.FormDefinition<InitialValues> => ({
  sections: [
    {
      id: 'email',
      fields: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email',
          className: emailClassName,
        },
      ],
    },
  ],
  submit: {
    text: 'Subscribe',
    className: submitClassName,
  },
});
