import React, { FC, useState } from 'react';

import type { Tabs } from '../../Forms/WheelSearch';
import { WheelSearchForm } from '../../Forms';

type Props = {
    data: {
        truckYears: string[];
        wheelDiameters: string[];
        wheelWidths: string[];
        wheelBoltPatterns: string[];
        wheelBrands: string[];
    };
};

export const Search: FC<Props> = ({ data }) => {
    const [currentTab, setCurrentTab] = useState<Tabs>('vehicle');
    return <WheelSearchForm currentTab={currentTab} updateCurrentTab={setCurrentTab} {...data} />;
};
