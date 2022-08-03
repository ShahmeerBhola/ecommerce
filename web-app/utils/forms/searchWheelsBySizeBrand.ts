import { object as YupObject, string as YupString } from 'yup';

export const initialValues: Forms.Definitions.SearchWheelsBySizeBrand = {
  diameter: '',
  width: '',
  bolt_pattern: '',
  brand: '',
};

export type InitialValues = typeof initialValues;

export const validationSchema = YupObject<InitialValues>({
  diameter: YupString(),
  width: YupString(),
  bolt_pattern: YupString(),
  brand: YupString(),
});

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'search',
      fields: [
        {
          name: 'diameter',
          type: 'select',
          placeholder: 'Wheel Diameter',
          className: 'w-full md:w-1/2',
        },
        {
          name: 'width',
          type: 'select',
          placeholder: 'Wheel Width',
          className: 'w-full md:w-1/2',
        },
        {
          name: 'bolt_pattern',
          type: 'select',
          placeholder: 'Bolt Pattern',
          className: 'w-full md:w-1/3',
        },
        {
          name: 'brand',
          type: 'select',
          placeholder: 'Wheel Brand',
          className: 'w-full md:w-1/3',
        },
      ],
    },
  ],
  submit: {
    text: 'Shop Wheels',
    className: 'w-full md:w-1/3',
  },
};
