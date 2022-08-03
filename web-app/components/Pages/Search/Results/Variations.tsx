import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { getQueryParams } from '../../../../utils';

import Slider from '../../../../components/Slider';

import { VariationCard } from './ProductCard';
import { VariationsFilters } from './VariationsFilters';
import { HTMLAttributes } from 'enzyme';

type Props = {
    product: WordPress.Product;
    onClose: () => void;
};

const CAROUSEL_SETTINGS = [
    {
        breakpoint: 1280,
        settings: {
            slidesToShow: 4,
        },
    },
    {
        breakpoint: 1024,
        settings: {
            slidesToShow: 3,
        },
    },
    {
        breakpoint: 768,
        settings: {
            slidesToShow: 2,
        },
    },
    {
        breakpoint: 640,
        settings: {
            slidesToShow: 1.25,
        },
    },
];

export const Variations: FC<Props & HTMLAttributes> = ({ product, onClose, ...rest }) => {
    const { variations } = product;
    const [filteredVariations, setFilteredVariations] = useState<WordPress.ProductVariation[]>([]);
    const [currentFilters, setCurrentFilters] = useState<StringMap>({});
    const [dimensions, setDimensions] = useState<StringMap<StringMap>>({});

    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...queryParams } = getQueryParams(router);
        const globalFilters: StringMap = {};

        for (const key in queryParams) {
            globalFilters['pa_' + key] = queryParams[key].replace('"', '');
        }

        setCurrentFilters((filters) => ({
            ...filters,
            ...globalFilters,
        }));
    }, []);

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

        if (dimensionsMap.size === 1) {
            setCurrentFilters((filters) => ({
                pa_diameter: Array.from(dimensionsMap)[0][1].pa_diameter,
                pa_width: Array.from(dimensionsMap)[0][1].pa_width,
                ...filters,
            }));
        }
    }, [variations]);

    useEffect(() => {
        const newFilteredVariations = variations.filter((variation) => {
            const { attributes } = variation;

            return Object.entries(currentFilters).every(([key, value]) => {
                return value === attributes[key];
            });
        });

        setFilteredVariations(newFilteredVariations);
    }, [currentFilters, variations]);

    const isCurrentDimension = (dimension: string): boolean => {
        const { pa_diameter, pa_width } = currentFilters;
        return dimension === `${pa_diameter}" x ${pa_width}"`;
    };

    const setDimensionFilter = (dimension: string): void => {
        const { pa_diameter, pa_width } = dimensions[dimension];

        setCurrentFilters((filters) => ({
            ...filters,
            pa_diameter,
            pa_width,
        }));
    };

    return (
        <div className="w-full p-1" {...rest}>
            <div className="py-4 bg-gray-50">
                <div>
                    <VariationsFilters onClose={onClose}>
                        {Object.keys(dimensions).map((dimension, key) => (
                            <div
                                key={key}
                                className={`bg-white rounded px-2 border border-gray-90 cursor-pointer select-none ${
                                    isCurrentDimension(dimension) ? 'text-red-100' : ''
                                }`}
                                onClick={(): void => setDimensionFilter(dimension)}
                            >
                                {dimension}
                            </div>
                        ))}
                    </VariationsFilters>
                </div>

                <div>
                    <Slider
                        className="sos-product-variants px-8"
                        slidesToShow={5}
                        infinite={false}
                        arrows={true}
                        slidesToScroll={5}
                        responsive={CAROUSEL_SETTINGS}
                    >
                        {filteredVariations.map((variation, key) => (
                            <VariationCard key={key} product={variation} parentProduct={product} isMini />
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};
