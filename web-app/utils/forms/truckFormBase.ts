import { string as YupString } from 'yup';

export const baseInitialValues: Forms.Definitions.BaseTruckForm = {
  year: '',
  make: '',
  model: '',
  trim: '',
  add_spare: false,
};

export type BaseInitialValues = typeof baseInitialValues;

export const baseValidationSchema = {
  year: YupString().required('Year is required'),
  make: YupString().required('Make is required'),
  model: YupString().required('Model is required'),
  trim: YupString().required('Trim is required'),
};

export const baseFields: Forms.Field<BaseInitialValues>[] = [
  {
    name: 'year',
    type: 'select',
    placeholder: 'Year',
    className: 'w-full',
  },
  {
    name: 'make',
    type: 'select',
    placeholder: 'Make',
    className: 'w-full',
  },
  {
    name: 'model',
    type: 'select',
    placeholder: 'Model',
    className: 'w-full',
  },
  {
    name: 'trim',
    type: 'select',
    placeholder: 'Trim',
    className: 'w-full',
  },
];

export const baseSubmit: Forms.SubmitFormField = {
  text: 'Add to Cart',
  className: 'w-full pb-2 flex flex-col',
  noBottomPadding: true,
};
