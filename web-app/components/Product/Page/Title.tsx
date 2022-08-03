import React, { FC, HTMLAttributes, useContext } from 'react';

import Text from '../../Text';

import { ProductContext } from './Context';

const ProductTitle: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product },
    } = useContext(ProductContext);

    const { name } = product as WordPress.Product;

    return (
        <div {...props}>
            <Text color="text-black" weight="font-bold" size="text-2xl">
                {name}
            </Text>
        </div>
    );
};

export default ProductTitle;
