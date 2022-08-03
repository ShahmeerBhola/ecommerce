import React, { FC } from 'react';

import Text from '../../Text';
import { RedDivider } from '../../Divider';
import ProductCategoryCubes from '../../ProductCategory';

type Props = {
    categories: WordPress.ProductCategory[];
};

export const Categories: FC<Props> = ({ categories }) => {
    return (
        <div className="mb-10">
            <Text h2 className="text-center sm:text-left">
                Check out our Selection
            </Text>
            <RedDivider mx="mx-auto" my="my-5" className="sm:mx-0" />
            <ProductCategoryCubes categories={categories} />
        </div>
    );
};
