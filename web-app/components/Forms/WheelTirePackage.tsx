import React from 'react';
import Form from '../Form';
import Loader from '../Loading';
import { WheelTirePackageAddOnsModal } from '../Modals';
import { SelectedWheelContext } from '../SelectedWheel';
import {
    mapValuesToSelectOptions,
    isAddSpareQueryParamTruthy,
    transformTruckToLocalTruck,
    getAddSpareQueryParam,
} from '../../utils';
import * as addTiresToWheel from '../../utils/forms/addTiresToWheel';
import WordPressClient from '../../utils/clients/wordpress';

type AddWheelToTiresIV = addTiresToWheel.InitialValues;

type Props = {
    tire: WordPress.Product;
    wheel?: WordPress.Product;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    spare?: boolean;
    onSpareChange?: (value: boolean) => void;
};

type State = {
    years: string[];
    makes: string[];
    models: string[];
    trims: string[];
    initialValues: AddWheelToTiresIV;
    isInitialValid: boolean;
    isLoading: boolean;
    modalIsOpen: boolean;
    selectedTruck: Truck.LocalOrNull;
    addOns: WordPress.Product[];
};

export default class WheelTirePackageForm extends React.Component<Props, State> {
    static contextType = SelectedWheelContext;
    context!: React.ContextType<typeof SelectedWheelContext>;

    constructor(props: Props) {
        super(props);

        const spareProps = this.props.spare || false;

        this.state = {
            years: [],
            makes: [],
            models: [],
            trims: [],
            initialValues: { ...addTiresToWheel.initialValues, add_spare: spareProps },
            isInitialValid: false,
            isLoading: false,
            modalIsOpen: false,
            selectedTruck: null,
            addOns: [],
        };
    }

    onSubmit = (data: AddWheelToTiresIV): void => {
        this.setState({ modalIsOpen: true, selectedTruck: transformTruckToLocalTruck(data) });
    };

    onModalClose = (): void => {
        this.setState({ modalIsOpen: false });
    };

    componentDidMount(): void {
        this.getFormData();
    }

    async getFormData(): Promise<void> {
        const { year, make, model, trim } = this.props;

        this.setState({ isLoading: true });

        const years = await WordPressClient.getTruckYears();
        const addOns = await WordPressClient.getWheelTirePackageAddOns(getAddSpareQueryParam());

        this.setState({ years, addOns }, async () => {
            if (year && years.includes(year)) {
                const makes = await WordPressClient.getTruckMakes(year);

                if (make && makes.includes(make)) {
                    const models = await WordPressClient.getTruckModels(year, make);

                    if (model && models.includes(model)) {
                        const trims = await WordPressClient.getTruckTrims(year, make, model);

                        if (trim && trims.includes(trim)) {
                            this.setState({
                                makes,
                                models,
                                trims,
                                initialValues: {
                                    year,
                                    make,
                                    model,
                                    trim,
                                    add_spare: isAddSpareQueryParamTruthy(),
                                },
                                isInitialValid: true,
                                isLoading: false,
                            });
                        }
                    }
                }
            } else {
                this.setState({ isLoading: false });
            }
        });
    }

    render(): JSX.Element {
        const {
            props: { tire, wheel: wheelInit, onSpareChange },
            context: { isLoading: isLoadingSelectedWheel, wheel: wheelContext },
            state: {
                years,
                makes,
                models,
                trims,
                initialValues,
                isInitialValid,
                isLoading: isLoadingTruck,
                modalIsOpen,
                selectedTruck,
                addOns,
            },
            onSubmit,
            onModalClose,
        } = this;
        const isLoading = isLoadingSelectedWheel || isLoadingTruck;
        const wheel = wheelInit || wheelContext;

        if (isLoading) {
            return <Loader paddingY="py-10" showCog={false} />;
        }

        return (
            <>
                <Form<AddWheelToTiresIV>
                    isInitialValid={isInitialValid}
                    initialValues={initialValues}
                    form={addTiresToWheel.definition}
                    validationSchema={addTiresToWheel.validationSchema}
                    onSubmit={onSubmit}
                    fieldOptions={{
                        year: mapValuesToSelectOptions(years),
                        make: mapValuesToSelectOptions(makes),
                        model: mapValuesToSelectOptions(models),
                        trim: mapValuesToSelectOptions(trims),
                    }}
                    onChangeHandlers={{
                        year: async (year: string): Promise<void> => {
                            const makes = await WordPressClient.getTruckMakes(year);
                            this.setState({ makes, models: [] });
                        },
                        make: async (make: string, { year }: AddWheelToTiresIV): Promise<void> => {
                            const models = await WordPressClient.getTruckModels(year, make);
                            this.setState({ models });
                        },
                        model: async (model: string, { year, make }: AddWheelToTiresIV): Promise<void> => {
                            const trims = await WordPressClient.getTruckTrims(year, make, model);
                            this.setState({ trims });
                        },
                        add_spare: (value): void => {
                            if (onSpareChange) onSpareChange(value);
                        },
                    }}
                    disabledFields={{
                        year: false,
                        make: makes.length === 0,
                        model: models.length === 0,
                        trim: trims.length === 0,
                    }}
                />
                <WheelTirePackageAddOnsModal
                    wheel={wheel}
                    tire={tire}
                    truck={selectedTruck}
                    addOns={addOns}
                    isOpen={modalIsOpen}
                    onClose={onModalClose}
                />
            </>
        );
    }
}
