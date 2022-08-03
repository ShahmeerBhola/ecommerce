import React, { FC } from 'react';
import isEmpty from 'lodash/isEmpty';

import Text from './ItemText';

type Props = {
    items?: StringMap;
    parent?: WordPress.Product;
};

const Attributes: FC<Props> = ({ items = {}, parent = {} }) => {
    const { _attributes = {} } = parent;

    if (isEmpty(items) && isEmpty(_attributes)) {
        return null;
    }

    return (
        <div className="flex flex-wrap mt-1 -mx-2 divide-x divide-gray-75">
            {Object.entries(_attributes).map(([key, { title }]) => (
                <Text key={key} color="text-gray-100" className="px-2 mt-2">
                    <span>{title} - </span>
                    <span className="text-gray-300">{items[key] || ''}</span>
                </Text>
            ))}
        </div>
    );
};

export default Attributes;
