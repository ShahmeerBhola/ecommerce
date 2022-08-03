import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';

import WordPressClient from '../../utils/clients/wordpress';
import { getAddSpareQueryParam, getQueryParams } from '../../utils';

export const SelectedWheelContext = React.createContext<SelectedWheel.Context>({
    wheel: null,
    isLoading: false,
});

const SelectedWheelProvider: React.FunctionComponent = ({ children }) => {
    const [wheel, updateWheel] = useState<WordPress.Product | null>(null);
    const [isLoading, updateLoading] = useState<boolean>(false);
    const router = useRouter();
    const { selected_wheel } = getQueryParams(router);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            updateLoading(true);

            const wheel = await WordPressClient.getProduct(selected_wheel as string, getAddSpareQueryParam());
            if (!isEmpty(wheel)) {
                updateWheel(wheel as WordPress.Product);
            }

            updateLoading(false);
        }

        if (selected_wheel) {
            fetchData();
        }
    }, [selected_wheel]);

    return <SelectedWheelContext.Provider value={{ wheel, isLoading }}>{children}</SelectedWheelContext.Provider>;
};

export default SelectedWheelProvider;
