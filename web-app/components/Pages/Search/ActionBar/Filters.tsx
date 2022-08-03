import React, { FC, useState } from 'react';
import { useRouter } from 'next/router';

import { getQueryParams, getPagePath } from '../../../../utils';

import SmallClose from '../../../Icons/SmallClose';
import { FancySelect } from '../../../Common';

type Props = {
    items: Search.Filter[];
};

const hasFilter = (items: Search.Filter[], queryParams: StringMap): boolean => {
    return [...items].some(({ queryKey }) => queryKey in queryParams);
};

export const Filters: FC<Props> = ({ items }) => {
    const [showAll, setShowAll] = useState<boolean>(false);
    const router = useRouter();

    const showItems = showAll ? items.length : 4;
    const queryParams = getQueryParams(router);

    const toggleFilters = (): void => {
        setShowAll((state) => !state);
    };

    const filterToggleLabel = showAll ? <SmallClose /> : 'More Filters';

    const onFilter = (value: string, key: string): void => {
        if (value) {
            if (queryParams[key] !== value) {
                router.push({ pathname: getPagePath(), query: { ...queryParams, [key]: value } });
            }
        } else if (key in queryParams) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [key]: __, ...newQueryParams } = queryParams;
            router.push({ pathname: getPagePath(), query: newQueryParams });
        }
    };

    const isFiltered = hasFilter(items, queryParams);

    const resetFilters = (): void => {
        if (isFiltered) {
            for (const { queryKey } of Object.values(items)) {
                if (queryKey in queryParams) {
                    delete queryParams[queryKey];
                }
            }

            router.push({ pathname: getPagePath(), query: queryParams });
        }
    };

    return (
        <div className="flex space-x-2 items-center text-sm text-gray-200 ">
            {items.slice(0, showItems).map(({ placeholder, options, queryKey }: any, key: number) => (
                <FancySelect
                    key={key}
                    label={placeholder}
                    defaultValue="any"
                    options={options}
                    onSelect={(value): void => onFilter(value, queryKey)}
                    currentValue={queryParams[queryKey] || null}
                />
            ))}

            <div className="rounded py-1 cursor-pointer select-none" onClick={toggleFilters}>
                <div className="ml-4">{filterToggleLabel}</div>
            </div>
            {isFiltered && (
                <div className="text-red-100 ml-2 cursor-pointer select-none" onClick={resetFilters}>
                    <div className="ml-2">Reset</div>
                </div>
            )}
        </div>
    );
};
