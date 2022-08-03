import React, { FC, HTMLAttributes, useContext, useState, useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';

import Text from '../../Text';

import { ProductContext } from './Context';

type AttributesCallbackType = {
    callback: (value: any) => void;
};

const AttributeItem: FC<
    { isSelected: boolean; isAvailable?: boolean } & AttributesCallbackType & HTMLAttributes<HTMLDivElement>
> = ({ isSelected, isAvailable, callback, children, ...props }) => {
    const activeClass = isSelected ? 'text-red-100' : 'text-gray-200';
    const notAvailableClass = !isAvailable ? 'text-opacity-50' : '';

    return (
        <div className="p-1" {...props}>
            <button
                style={{ outline: 0 }}
                className={`px-2 text-sm rounded border-solid border border-current ${activeClass} ${notAvailableClass}`}
                onClick={callback}
            >
                {children}
            </button>
        </div>
    );
};

const AttributeGroup: FC<
    { value: WordPress.Attribute; selectedValue: string; activeValues: string[] } & AttributesCallbackType &
        HTMLAttributes<HTMLDivElement>
> = ({ value: { title, options }, selectedValue, activeValues, callback, ...props }) => {
    if (options.length < 1) {
        return null;
    }

    return (
        <div className="my-2 flex items-center" {...props}>
            <Text size="text-sm" color="text-black" className="mr-5">
                {`${title}:`}
            </Text>

            <div className="flex flex-wrap">
                {options.map((item, index) => (
                    <AttributeItem
                        key={index}
                        isSelected={selectedValue === item}
                        isAvailable={activeValues.includes(item)}
                        callback={(): void => callback(item)}
                    >
                        {item}
                    </AttributeItem>
                ))}
            </div>
        </div>
    );
};

const DimensionGroup: FC<
    {
        product: WordPress.Product;
        selectedValue: StringMap;
        activeValues: StringMap<string[]>;
    } & AttributesCallbackType &
        HTMLAttributes<HTMLDivElement>
> = ({ product, selectedValue, activeValues, callback, ...props }) => {
    const [dimensions, setDimensions] = useState<StringMap<StringMap>>({});

    const { variations } = product;

    useEffect(() => {
        const dimensionsMap = new Map();

        for (const { attributes } of variations) {
            const { pa_diameter, pa_width } = attributes;
            const dimensionKey = `${pa_diameter}" x ${pa_width}"`;

            if (!dimensionsMap.has(dimensionKey)) {
                dimensionsMap.set(dimensionKey, {
                    pa_diameter: pa_diameter,
                    pa_width: pa_width,
                });
            }
        }

        setDimensions(Object.fromEntries(dimensionsMap));
    }, [variations]);

    const isSelected = (values: StringMap, selected: StringMap): boolean => {
        return Object.entries(values).every(([key, value]) => selected[key] === value);
    };

    const isActive = (values: StringMap, active: StringMap<string[]>): boolean => {
        return Object.entries(values).every(([key, value]) => active[key].includes(value));
    };

    return (
        <div className="my-2 flex items-center" {...props}>
            <Text size="text-sm" color="text-black" className="mr-5">
                Dimensions:
            </Text>

            <div className="flex flex-wrap">
                {Object.entries(dimensions).map(([key, value], index) => (
                    <AttributeItem
                        key={index}
                        isSelected={isSelected(value, selectedValue)}
                        isAvailable={isActive(value, activeValues)}
                        callback={(): void => callback(value)}
                    >
                        {key}
                    </AttributeItem>
                ))}
            </div>
        </div>
    );
};

const ProductAttributes: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product, currentAttributes, availableAttributes = {} },
        dispatch,
    } = useContext(ProductContext);

    const { _attributes = {} } = product as WordPress.Product;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pa_diameter, pa_width, pa_wheel_offset, ...showAttributes } = _attributes;

    if (isEmpty(_attributes)) {
        return null;
    }

    const attributeSwitcher = (value: string, key: string): void => {
        dispatch({ type: 'selectAttribute', payload: { [key]: value } });
    };

    const dimensionSwitcher = (value: StringMap): void => {
        dispatch({ type: 'selectAttribute', payload: value });
    };

    return (
        <div {...props}>
            <DimensionGroup
                product={product}
                activeValues={availableAttributes}
                selectedValue={currentAttributes}
                callback={(selectedValue: StringMap): void => dimensionSwitcher(selectedValue)}
            />
            {Object.entries(showAttributes).map(([key, value]) => (
                <AttributeGroup
                    key={key}
                    value={value}
                    selectedValue={currentAttributes[key] || ''}
                    activeValues={availableAttributes[key] || []}
                    callback={(selectedValue: string): void => attributeSwitcher(selectedValue, key)}
                />
            ))}
        </div>
    );
};

export default ProductAttributes;
