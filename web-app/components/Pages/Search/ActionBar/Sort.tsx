import React, { FC } from 'react';
import { useRouter } from 'next/router';

import { getQueryParams, getPagePath } from '../../../../utils';

import { FancySelect } from '../../../Common';

const sortOptions: Forms.FieldOption<WordPress.ProductSortOption>[] = [
    {
        label: 'Price (Low to High)',
        value: 'price-lth',
    },
    {
        label: 'Price (High to Low)',
        value: 'price-htl',
    },
    {
        label: 'Popular',
        value: 'popular',
    },
    {
        label: 'Newest',
        value: 'newest',
    },
];

export const Sort: FC = () => {
    const router = useRouter();

    const queryParams = getQueryParams(router);

    const sortHandler = (value: string): void => {
        if (value) {
            if (queryParams.sort !== value) {
                router.push({ pathname: getPagePath(), query: { ...queryParams, sort: value } });
            }
        } else if ('sort' in queryParams) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { sort: __, ...newQueryParams } = queryParams;
            router.push({ pathname: getPagePath(), query: newQueryParams });
        }
    };

    return (
        <div>
            <FancySelect
                options={sortOptions}
                label="Sort by"
                defaultValue="default"
                isPlain
                onSelect={sortHandler}
                currentValue={queryParams.sort || null}
            />
        </div>
    );
};
