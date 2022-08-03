import { object as YupObject, boolean as YupBoolean } from 'yup';
import { baseInitialValues, BaseInitialValues, baseValidationSchema, baseFields, baseSubmit } from './truckFormBase';

export const initialValues: Forms.Definitions.TruckRequiredForProduct = baseInitialValues;

export type InitialValues = BaseInitialValues;

export const validationSchema = YupObject<InitialValues>({
  ...baseValidationSchema,
  add_spare: YupBoolean(),
});

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'search',
      yMargin: '',
      noXPadding: true,
      fields: [
        ...baseFields,
        {
          name: 'add_spare',
          type: 'checkbox',
          placeholder: 'Add Spare?',
          className: 'w-full',
        },
      ],
    },
  ],
  submit: {
    ...baseSubmit,
    text: 'Finish Building Package',
  },
};
