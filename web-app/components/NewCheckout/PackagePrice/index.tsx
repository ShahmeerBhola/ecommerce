import React, { FC } from 'react';

import Price from '../../Price';

type Props = {
    total: number;
};

export const PackagePrice: FC<Props> = ({ total }) => {
    return (
        <h3 className="flex justify-end text-gray-100 text-2xl text-right space-x-1 leading-none">
            <span>Subtotal</span>
            <Price price={total} size="text-2xl" />
        </h3>
    );
};
