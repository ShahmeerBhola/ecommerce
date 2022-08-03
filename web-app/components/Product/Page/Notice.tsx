import React, { FC, HTMLAttributes, useContext } from 'react';

import Text from '../../Text';

import { ProductContext } from './Context';

const ProductNotice: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product },
    } = useContext(ProductContext);

    const { brand } = product as WordPress.Product;
    const noticeText = brand?.lead_time;

    if (!noticeText) {
        return null;
    }

    return (
        <div {...props}>
            <Text size="text-sm" color="text-red-100" weight="font-bold" className="mb-1">
                Notice
            </Text>
            <Text size="text-sm" weight="font-medium">
                {noticeText}
            </Text>
        </div>
    );
};

export default ProductNotice;
