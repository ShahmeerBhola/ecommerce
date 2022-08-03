import React, { FC, HTMLAttributes, useContext } from 'react';

import { calculateSoldAsQuantityTextFromParams } from '../../../utils';

import Text from '../../Text';

import { ProductContext } from './Context';

const ProductInfo: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product, queryParams, variation },
    } = useContext(ProductContext);

    const { sku: variationSku } = variation || {};
    const { brand, sku, quantity_sold_in, sold_as_truck_set } = product as WordPress.Product;

    const productData = [
        {
            title: 'Brand',
            value: brand?.name,
        },
        {
            title: 'Sku',
            value: variationSku || sku,
        },
        {
            title: 'Sold as',
            value: calculateSoldAsQuantityTextFromParams(quantity_sold_in, sold_as_truck_set, queryParams),
        },
    ];

    return (
        <div {...props}>
            {productData
                .filter((el) => !!el.value)
                .map(({ title, value }, index) => (
                    <div key={index} className="my-2 flex items-center">
                        <Text size="text-sm" color="text-black" weight="font-bold" className="mr-5">
                            {`${title}:`}
                        </Text>
                        <Text size="text-sm">{value}</Text>
                    </div>
                ))}
        </div>
    );
};

export default ProductInfo;
