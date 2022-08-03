import React, { FC } from 'react';

import { numberWithCommas } from '../../../../utils';

import Text from '../../../Text';
import Pagination from '../../../Search/Pagination';
import { GrayDivider } from '../../../Divider';

import { ActionBar } from '../ActionBar';

type Props = {
    pagination: WordPress.Pagination;
    filters: Search.Filter[];
};

export const Catalog: FC<Props> = ({ pagination, filters, children }) => {
    return (
        <div className="pt-0 pb-5 lg:pt-10 lg:pb-10 px-0 lg:px-5 lg:container lg:mx-auto">
            <ActionBar filters={filters} />
            <div className="w-full mt-5 lg:mt-0 px-5 lg:px-0">
                {children}
                <GrayDivider my="my-5" />
                <div className="flex flex-wrap justify-between items-center">
                    <Text size="text-sm" className="my-3 sm:my-0">
                        Total search results&nbsp;&nbsp;
                        <span className="text-red-100">{numberWithCommas(pagination.total.toString())}</span>
                    </Text>
                    <Pagination pagination={pagination} />
                </div>
            </div>
        </div>
    );
};
