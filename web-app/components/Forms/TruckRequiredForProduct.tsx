import React from 'react';
import Form from '../Form';
import { CartContext } from '../Cart';
import Loader from '../Loading';
import { mapValuesToSelectOptions, isAddSpareQueryParamTruthy } from '../../utils';
import * as truckRequiredForProduct from '../../utils/forms/truckRequiredForProduct';
import WordPressClient from '../../utils/clients/wordpress';

type TruckRequiredForProductIV = truckRequiredForProduct.InitialValues;

type Props = {
    product: WordPress.ProductBase;
    externalDisableSubmit?: boolean;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
};

type State = {
    years: string[];
    makes: string[];
    models: string[];
    trims: string[];
    initialValues: TruckRequiredForProductIV;
    isInitialValid: boolean;
    isLoading: boolean;
};

export default class WheelTirePackageForm extends React.Component<Props, State> {
    static contextType = CartContext;
    context!: React.ContextType<typeof CartContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            years: [],
            makes: [],
            models: [],
            trims: [],
            initialValues: truckRequiredForProduct.initialValues,
            isInitialValid: false,
            isLoading: true,
        };
    }

    onSubmit = ({ add_spare: _add_spare, ...data }: TruckRequiredForProductIV): void => {
        const {
            context: { addLineItem },
            props: { product },
        } = this;
        addLineItem(product, { ...data, addSpare: false });
    };

    componentDidMount = async (): Promise<void> => {
        const { year, make, model, trim } = this.props;
        const years = await WordPressClient.getTruckYears();

        this.setState({ years }, async () => {
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
    };

    render(): JSX.Element {
        const {
            props: { externalDisableSubmit = false },
            state: { years, makes, models, trims, initialValues, isInitialValid, isLoading },
            onSubmit,
        } = this;

        if (isLoading) {
            return <Loader paddingY="py-10" showCog={false} />;
        }

        return (
            <Form<TruckRequiredForProductIV>
                isInitialValid={isInitialValid}
                initialValues={initialValues}
                form={truckRequiredForProduct.definition}
                validationSchema={truckRequiredForProduct.validationSchema}
                onSubmit={onSubmit}
                externalDisableSubmit={externalDisableSubmit}
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
                    make: async (make: string, { year }: TruckRequiredForProductIV): Promise<void> => {
                        const models = await WordPressClient.getTruckModels(year, make);
                        this.setState({ models });
                    },
                    model: async (model: string, { year, make }: TruckRequiredForProductIV): Promise<void> => {
                        const trims = await WordPressClient.getTruckTrims(year, make, model);
                        this.setState({ trims });
                    },
                }}
                disabledFields={{
                    year: false,
                    make: makes.length === 0,
                    model: models.length === 0,
                    trim: trims.length === 0,
                }}
            />
        );
    }
}
