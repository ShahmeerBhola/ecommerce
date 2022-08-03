import React, { FC, HTMLAttributes, useContext } from 'react';
import isEmpty from 'lodash/isEmpty';

import Price from '../../Price';

import { ProductContext } from './Context';

const ProductPrice: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product, variation },
    } = useContext(ProductContext);

    const { price, sale_price, variations } = product as WordPress.Product;
    const { price: variationPrice, sale_price: variationSalePrice } = variation || {};

    return (
        <div {...props}>
            <Price
                price={variationPrice || price}
                salePrice={variationSalePrice || sale_price}
                variations={variations}
                hideVariationPricing={!isEmpty(variation)}
                weight="font-bold"
                size="text-xl"
            />
        </div>
    );
};

export default ProductPrice;
