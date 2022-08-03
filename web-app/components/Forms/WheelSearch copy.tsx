import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import { forOwn } from 'lodash';

import WordPressClient from '../../utils/clients/wordpress';
import { mapValuesToSelectOptions, constructUrl } from '../../utils';
import * as searchWheelsByVehicle from '../../utils/forms/searchWheelsByVehicle';
import * as searchWheelsBySizeBrand from '../../utils/forms/searchWheelsBySizeBrand';

import { Tab, TabPanel } from '../Tabs';
import Form from '../Form';

export type Tabs = 'vehicle' | 'sizeBrand';

type SearchByVehiclesIV = searchWheelsByVehicle.InitialValues;
type SearchBySizeBrandIV = searchWheelsBySizeBrand.InitialValues;

type SearchFormProps = {
    currentTab: Tabs;
    updateCurrentTab: (tab: Tabs) => void;
    truckYears: string[];
    wheelDiameters: string[];
    wheelWidths: string[];
    wheelBoltPatterns: string[];
    wheelBrands: string[];
};

type SearchFormState = {
    truckMakes: string[];
    truckModels: string[];
    truckTrims: string[];
};

export default class SearchForms extends React.Component<SearchFormProps, SearchFormState> {
    constructor(props: SearchFormProps) {
        super(props);

        this.state = {
            truckMakes: [],
            truckModels: [],
            truckTrims: [],
        };
    }

    handleSearchFormSubmit = (data: SearchByVehiclesIV | SearchBySizeBrandIV): void => {
        NProgress.start();
        const queryParams: StringMap = {};

        /*
      the search by size/brand form allows specifying, at a minimum 1 field
      this means some values may be null/empty string.. don't append these to the query string
    */
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

    render(): JSX.Element {
        const {
            props,
            handleSearchFormSubmit,
            state: { truckMakes, truckModels, truckTrims },
        } = this;
        const { currentTab, updateCurrentTab } = props;

        const truckYears = mapValuesToSelectOptions(props.truckYears);
        const wheelDiameters = mapValuesToSelectOptions(props.wheelDiameters);
        const wheelWidths = mapValuesToSelectOptions(props.wheelWidths);
        const wheelBoltPatterns = mapValuesToSelectOptions(props.wheelBoltPatterns);
        const wheelBrands = mapValuesToSelectOptions(props.wheelBrands);

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
                    <Form<SearchByVehiclesIV>
                        initialValues={searchWheelsByVehicle.initialValues}
                        form={searchWheelsByVehicle.definition}
                        validationSchema={searchWheelsByVehicle.validationSchema}
                        onSubmit={handleSearchFormSubmit}
                        fieldOptions={{
                            year: truckYears,
                            make: mapValuesToSelectOptions(truckMakes),
                            model: mapValuesToSelectOptions(truckModels),
                            trim: mapValuesToSelectOptions(truckTrims),
                        }}
                        onChangeHandlers={{
                            year: async (year: string): Promise<void> => {
                                const truckMakes = await WordPressClient.getTruckMakes(year);
                                this.setState({
                                    truckMakes,
                                    truckModels: [],
                                    truckTrims: [],
                                });
                            },
                            make: async (make: string, { year }: SearchByVehiclesIV): Promise<void> => {
                                const truckModels = await WordPressClient.getTruckModels(year, make);
                                this.setState({
                                    truckModels,
                                    truckTrims: [],
                                });
                            },
                            model: async (model: string, { year, make }: SearchByVehiclesIV): Promise<void> => {
                                const truckTrims = await WordPressClient.getTruckTrims(year, make, model);
                                this.setState({ truckTrims });
                            },
                        }}
                        disabledFields={{
                            year: false,
                            make: truckMakes.length === 0,
                            model: truckModels.length === 0,
                            trim: truckTrims.length === 0,
                        }}
                    />
                </TabPanel>
                <TabPanel active={currentTab === 'sizeBrand'}>
                    <Form<SearchBySizeBrandIV>
                        initialValues={searchWheelsBySizeBrand.initialValues}
                        form={searchWheelsBySizeBrand.definition}
                        validationSchema={searchWheelsBySizeBrand.validationSchema}
                        onSubmit={handleSearchFormSubmit}
                        fieldOptions={{
                            diameter: wheelDiameters,
                            width: wheelWidths,
                            bolt_pattern: wheelBoltPatterns,
                            brand: wheelBrands,
                        }}
                    />
                </TabPanel>
            </div>
        );
    }
}
