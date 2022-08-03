import React, { FC } from 'react';

import { Filters } from './Filters';
import { Sort } from './Sort';

type Props = {
    filters: Search.Filter[];
};

export const ActionBar: FC<Props> = ({ filters }) => {
    return (
        <div className="mb-6 sticky top-0 z-50 bg-white">
            <div className="border-solid border-gray-80 border-b-2 py-3 flex justify-between items-center">
                <div>
                    <Filters items={filters} />
                </div>
                <div>
                    <Sort />
                </div>
            </div>
        </div>
    );
};
