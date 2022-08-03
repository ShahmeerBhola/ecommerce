import React, { FC, useState } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import forOwn from 'lodash/forOwn';
import { useToasts } from 'react-toast-notifications';

import WordPressClient from '../../utils/clients/wordpress';
import { mapValuesToSelectOptions, constructUrl } from '../../utils';

import * as searchWheelsByVehicle from '../../utils/forms/searchWheelsByVehicle';
import * as searchWheelsBySizeBrand from '../../utils/forms/searchWheelsBySizeBrand';

import { Tab, TabPanel } from '../Tabs';
import Form from '../Form';

export type Tabs = 'vehicle' | 'sizeBrand';

type SearchByVehiclesIV = searchWheelsByVehicle.InitialValues;
type SearchBySizeBrandIV = searchWheelsBySizeBrand.InitialValues;

type Props = {
    currentTab: Tabs;
    updateCurrentTab: (tab: Tabs) => void;
    truckYears: string[];
    wheelDiameters: string[];
    wheelWidths: string[];
    wheelBoltPatterns: string[];
    wheelBrands: string[];
};

const toSelectOptions = (object: StringMap<string[]>): StringMap<Forms.FieldOption<string>[]> => {
    console.log("object",object)
    return Object.fromEntries(Object.entries(object).map(([key, values]) => [key, mapValuesToSelectOptions(values)]));
};

const SearchByVehicle: FC<{ options: StringMap<string[]> }> = ({ options }) => {
    const [fieldOptions, setFieldOptions] = useState<{ [key: string]: Forms.FieldOption<string>[] }>(() => {
        const selectOptions = { ...options, make: [], model: [], trim: [] };

        return toSelectOptions(selectOptions);
    });

    const { addToast } = useToasts();

    const { initialValues, definition, validationSchema } = searchWheelsByVehicle;

    const searchHandler = async (data: SearchByVehiclesIV, helpers: any): Promise<void> => {
        const { make, model, trim, year } = data;

        if (make && model && trim && year) {
            NProgress.start();
            helpers.setSubmitting(true);
            const boltPattern = await WordPressClient.getTruckModelBoltPatterns(year, make, model, trim);

            if (boltPattern) {
                Router.push({
                    pathname: constructUrl({ page: 'category', extra: 'wheels' }),
                    query: { bolt_pattern: boltPattern, page: 1 },
                });
            } else {
                addToast('No wheels found, please check vehicle info.', { appearance: 'error' });
                helpers.setSubmitting(false);
            }
        }
    };

    const updateTruckMakes = async (year: string): Promise<void> => {
        const makes = await WordPressClient.getTruckMakes(year);
        console.log("makes",makes)

        setFieldOptions({
            ...fieldOptions,
            model: [],
            trim: [],
            ...toSelectOptions({ make: makes }),
        });
    };

    const updateTruckModels = async (make: string, { year }: SearchByVehiclesIV): Promise<void> => {
        const models = await WordPressClient.getTruckModels(year, make);

        setFieldOptions({
            ...fieldOptions,
            trim: [],
            ...toSelectOptions({ model: models }),
        });
    };

    const updateTruckTrims = async (model: string, { year, make }: SearchByVehiclesIV): Promise<void> => {
        const trims = await WordPressClient.getTruckTrims(year, make, model);

        setFieldOptions({
            ...fieldOptions,
            ...toSelectOptions({ trim: trims }),
        });
    };

    return (
        <Form<SearchByVehiclesIV>
            initialValues={initialValues}
            form={definition}
            validationSchema={validationSchema}
            onSubmit={searchHandler}
            fieldOptions={fieldOptions}
            onChangeHandlers={{
                year: updateTruckMakes,
                make: updateTruckModels,
                model: updateTruckTrims,
            }}
            disabledFields={{
                year: false,
                make: fieldOptions.make.length === 0,
                model: fieldOptions.model.length === 0,
                trim: fieldOptions.trim.length === 0,
            }}
        />
    );
};

const SearchByBrand: FC<{ options: StringMap<string[]> }> = ({ options }) => {
    const [fieldOptions] = useState<{ [key: string]: Forms.FieldOption<string>[] }>(() => {
        return toSelectOptions(options);
    });
    const { initialValues, definition, validationSchema } = searchWheelsBySizeBrand;

    const searchHandler = (data: SearchBySizeBrandIV): void => {
        NProgress.start();
        const queryParams: StringMap = {};

        forOwn(data, (val, key) => {
            if (val) {
                queryParams[key] = val;
            }
        });

        Router.push({
            pathname: constructUrl({ page: 'category', extra: 'wheels' }),
            query: { ...queryParams, page: 1 },
        });
    };

    return (
        <Form<SearchBySizeBrandIV>
            initialValues={initialValues}
            form={definition}
            validationSchema={validationSchema}
            onSubmit={searchHandler}
            fieldOptions={fieldOptions}
        />
    );
};

const SearchForms: FC<Props> = ({
    currentTab,
    updateCurrentTab,
    truckYears: year,
    wheelDiameters: diameter,
    wheelWidths: width,
    wheelBoltPatterns: bolt_pattern,
    wheelBrands: brand,
}) => {
    return (
        <div className="absolute my-20 left-0 right-0 -bottom-25rem md:-bottom-13rem lg:-bottom-11rem react-tabs px-5 md:px-0">
            <div className="flex">
                <Tab selected={currentTab === 'vehicle'} onClick={(): void => updateCurrentTab('vehicle')}>
                    Search Wheels By Vehicle
                </Tab>
                <Tab selected={currentTab === 'sizeBrand'} onClick={(): void => updateCurrentTab('sizeBrand')}>
                    Search Wheels By Size &amp; Brand
                </Tab>
            </div>
            <TabPanel active={currentTab === 'vehicle'}>
                <SearchByVehicle options={{ year }} />
            </TabPanel>
            <TabPanel active={currentTab === 'sizeBrand'}>
                <SearchByBrand options={{ diameter, width, bolt_pattern, brand }} />
            </TabPanel>
        </div>
    );
};

export default SearchForms;
