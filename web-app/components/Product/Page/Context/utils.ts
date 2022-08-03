import isEmpty from 'lodash/isEmpty';

import type { TProductContext } from './types';

export const getSingleAttributes = (_attributes?: StringMap<string[]>): StringMap => {
    let singleAttributes = {};

    for (const [key, value] of Object.entries(_attributes || {})) {
        if (value.length === 1) {
            singleAttributes = {
                ...singleAttributes,
                [key]: value[0],
            };
        }
    }

    return singleAttributes;
};

export const getAvailableAttributes = (
    variations: WordPress.ProductVariation[],
    newAttributes: StringMap,
): StringMap<string[]> => {
    const availableAttribute: StringMap<string[]> = {};

    for (const { attributes } of variations) {
        let isAvailableAttribute = true;

        for (const [key, value] of Object.entries(newAttributes)) {
            isAvailableAttribute = isAvailableAttribute && attributes[key] === value;
        }

        if (isAvailableAttribute) {
            for (const [key, value] of Object.entries(attributes)) {
                const currentAttribute = availableAttribute[key] || [];

                if (currentAttribute.indexOf(value) > -1) {
                    continue;
                }

                availableAttribute[key] = [...currentAttribute, value];
            }
        }
    }

    return availableAttribute;
};

const getAttributes = (
    variations: WordPress.ProductVariation[],
    selectedAttributes: {} | StringMap,
): TProductContext.CheckAttributesType => {
    const availableAttributes = getAvailableAttributes(variations, selectedAttributes);
    const singleAttributes = getSingleAttributes(availableAttributes);

    return {
        currentAttributes: {
            ...selectedAttributes,
            ...singleAttributes,
        },
        availableAttributes,
    };
};

export const checkAttributes = (state: TProductContext.State, payload: any): TProductContext.CheckAttributesType => {
    const { currentAttributes, product } = state;
    const { variations } = product as WordPress.Product;
    const newAttributes = {
        ...currentAttributes,
        ...payload,
    };

    const attributes = getAttributes(variations, newAttributes);

    if (isEmpty(attributes.availableAttributes)) {
        const resetAttributes = {
            ...payload,
        };

        return getAttributes(variations, resetAttributes);
    }

    return attributes;
};

export const isActiveAttribute = (attributes: StringMap, currentAttributes: StringMap): boolean => {
    return Object.entries(attributes).reduce<boolean>((isSelectedAttribute, attribute) => {
        const [key, value] = attribute;
        const matchedAttribute = value === '' || currentAttributes[key] === value;

        return isSelectedAttribute && matchedAttribute;
    }, true);
};
