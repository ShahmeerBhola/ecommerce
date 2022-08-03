import { object as YupObject } from 'yup';

import { yupTruck, yupTruckInitialValues } from '..';

export const initialValues: Forms.Definitions.SearchWheelsByVehicle = yupTruckInitialValues;
export type InitialValues = typeof initialValues;
export const validationSchema = YupObject<InitialValues>(yupTruck);

export const definition: Forms.FormDefinition<InitialValues> = {
    sections: [
        {
            id: 'search',
            fields: [
                {
                    name: 'year',
                    type: 'select',
                    placeholder: 'Year',
                    className: 'w-full md:w-1/2',
                },
                {
                    name: 'make',
                    type: 'select',
                    placeholder: 'Make',
                    className: 'w-full md:w-1/2',
                },
                {
                    name: 'model',
                    type: 'select',
                    placeholder: 'Model',
                    className: 'w-full md:w-1/3',
                },
                {
                    name: 'trim',
                    type: 'select',
                    placeholder: 'Trim',
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
