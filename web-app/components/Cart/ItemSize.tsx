import React, { FC } from 'react';
import isEmpty from 'lodash/isEmpty';

import { productIsTire, productIsWheel, constructWheelDimension, constructTireDimension } from '../../utils';
import Text from './ItemText';

type Props = {
    metadata: WordPress.ProductMetadata;
    categories: WordPress.ProductCategory[];
};

const Size: FC<Props> = ({ categories, metadata }) => {
    let size: string | null = null;

    if (productIsWheel(categories)) {
        size = constructWheelDimension(metadata as WordPress.WheelMetadata);
    } else if (productIsTire(categories)) {
        size = constructTireDimension(metadata as WordPress.TireMetadata);
    }

    if (isEmpty(size)) {
        return null;
    }

    return (
        <Text color="text-red-100" className="mt-2">
            Size - {size}
        </Text>
    );
};

export default Size;
