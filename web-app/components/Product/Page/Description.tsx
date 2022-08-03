import React, { FC, HTMLAttributes, useContext } from 'react';

import Text from '../../Text';

import { ProductContext } from './Context';

const ProductDescription: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product },
    } = useContext(ProductContext);

    const { description /* metadata */ } = product as WordPress.Product;

    return (
        <div {...props}>
            {description && (
                <>
                    <Text weight="font-bold" color="text-red-100" className="uppercase my-5">
                        Description
                    </Text>
                    <div
                        className="font-primary font-normal text-gray-100 text-sm mb-5"
                        dangerouslySetInnerHTML={{ __html: description }}
                    ></div>
                </>
            )}
            {/* {Object.entries(metadata).map(([key, value]) => (
                <div className="flex py-1" key={key}>
                    <Text size="text-sm" className="w-1/2">
                        {key}:
                    </Text>
                    <Text size="text-sm" color="text-black" className="w-1/2">
                        {value}
                    </Text>
                </div>
            ))} */}
        </div>
    );
};

export default ProductDescription;
