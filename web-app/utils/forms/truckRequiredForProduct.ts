import { object as YupObject } from 'yup';
import { baseInitialValues, BaseInitialValues, baseValidationSchema, baseFields, baseSubmit } from './truckFormBase';

export const initialValues: Forms.Definitions.TruckRequiredForProduct = baseInitialValues;

export type InitialValues = BaseInitialValues;

export const validationSchema = YupObject<Omit<InitialValues, 'add_spare'>>(baseValidationSchema);

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'search',
      yMargin: '',
      noXPadding: true,
      fields: baseFields,
    },
  ],
  submit: baseSubmit,
};
