import React from 'react';
import Select from '../Form/Select';
import { mapObjectToSelectOptions, toTitleCase } from '../../utils';
import findIndex from 'lodash/findIndex';

type Props = {
    product: WordPress.Product;
    selectedVariant: WordPress.ProductVariation | null;
    onVariantSelect: (variant: WordPress.ProductVariation) => void;
    className?: string;
};

const Variations: React.FunctionComponent<Props> = ({
    product: { variations },
    selectedVariant,
    onVariantSelect,
    className,
}) => {
    // Right now this will only work for one variation attribute, if in the future we
    // have products w/ more than one variation attribute, will need to modify this
    // component
    const attributes: { [k: string]: StringMap } = {};

    variations.forEach(({ id, attributes: variationAttrs }) => {
        Object.keys(variationAttrs).forEach((key) => {
            const attrValue = variationAttrs[key];
            if (key in attributes) {
                attributes[key] = {
                    ...attributes[key],
                    [id]: attrValue,
                };
            } else {
                attributes[key] = {
                    [id]: attrValue,
                };
            }
        });
    });

    const handleSelectVariationChange = (evt: Forms.ChangeEvent): void => {
        const selectedVariantIdx = findIndex(variations, (variation) => variation.id.toString() === evt.target.value);

        if (selectedVariantIdx !== -1) {
            onVariantSelect(variations[selectedVariantIdx]);
        }
    };
    // for (let [key, value] of Object.entries(attributes)) {
    //   for (let [k, v] of Object.entries(value)) {
    //     console.log(`${k}: ${v}`);
    //   }
    // }
    return (
        <div className={className}>
            {Object.keys(attributes).map((attr) => (
                <div className="my-1" key={attr}>
                    <Select
                        name={attr}
                        value={selectedVariant?.id.toString() || ''}
                        placeholder={toTitleCase(attr)}
                        options={mapObjectToSelectOptions(attributes[attr])}
                        onChange={handleSelectVariationChange}
                    />
                </div>
            ))}
        </div>
    );
};

export default Variations;
