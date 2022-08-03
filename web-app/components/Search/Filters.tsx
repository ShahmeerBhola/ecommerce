import React, { FC, useState } from 'react';
import { useRouter } from 'next/router';

import { modifyQueryParam, clearAllQueryParams } from '../../utils';

import WhiteBox from '../WhiteBox';
import { DownArrowIcon, SmallCloseIcon } from '../Icons';
import Text from '../Text';
import { GrayDivider } from '../Divider';
import FilterGroup, { Props as FilterProps, ScrollMobileProps as FilterScrollMobileProps } from './Filter';

type Props = {
    filters: Search.Filter[];
    mobile?: boolean;
};

type ActiveFilterProps = {
    value: string;
    onClick: () => void;
};

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

const SortFilter: FC<FilterScrollMobileProps> = (props) => (
    <FilterGroup placeholder="Sort" queryKey="sort" options={sortOptions} {...props} />
);

const ActiveFilter: FC<ActiveFilterProps> = ({ value, onClick }) => (
    <div className="flex items-center mt-1 mr-2">
        <div className="py-1 px-3 shadow-sm no-underline rounded-full bg-transparent text-black font-primary text-sm border-red-100 border btn-primary focus:outline-none active:shadow-none mr-1">
            {value}
        </div>
        <SmallCloseIcon onClick={onClick} />
    </div>
);

const ActiveFilters: FC = () => {
    const router = useRouter();
    const queryProps = router.query as StringMap;

    // TODO: reimplement active filters soon
    return null;

    const filtersToIgnore = ['sort', 'page', 'year', 'make', 'model', 'trim'];
    const activeFilters = Object.keys(router.query).filter((key) => !filtersToIgnore.includes(key));

    if (activeFilters.length === 0) {
        return null;
    }

    const clearFilter = (key: string): void => modifyQueryParam(router, key, null);
    const clearAllFilters = (): void => clearAllQueryParams(router);

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between">
                <Text color="text-red-100">Active Filters</Text>
                <button
                    onClick={clearAllFilters}
                    className="py-1 px-2 shadow-sm no-underline rounded-full bg-red-100 text-white font-primary text-xs border-red-100 btn-primary hover:text-white hover:bg-red-200 focus:outline-none active:shadow-none uppercase"
                >
                    Clear Filters
                </button>
            </div>

            <div className="flex flex-wrap mt-2">
                {activeFilters.map((key) => (
                    <ActiveFilter key={key} value={queryProps[key]} onClick={(): void => clearFilter(key)} />
                ))}
            </div>
        </div>
    );
};

const DesktopFilters: FC<Props> = ({ filters }) => {
    const Filter: FC<FilterProps> = (props) => (
        <div className="mb-3">
            <FilterGroup {...props} />
        </div>
    );

    const Divider = (): JSX.Element => <GrayDivider my="my-4" />;

    const numFilters = filters.length;

    return (
        <WhiteBox className="flex flex-col p-4">
            <SortFilter scroll={false} />
            {numFilters > 0 && <Divider />}
            <ActiveFilters />
            {filters.map((filter, idx) => (
                <React.Fragment key={filter.queryKey}>
                    <Filter {...filter} />
                    {idx + 1 !== numFilters ? <Divider /> : null}
                </React.Fragment>
            ))}
        </WhiteBox>
    );
};

const MobileFilters: FC<Props> = ({ filters }) => {
    const [isOpen, toggleOpenState] = useState<boolean>(false);
    const onTextClick = (): void => toggleOpenState(!isOpen);

    return (
        <>
            <div className="flex flex-col items-center bg-red-100 p-2 text-center cursor-pointer" onClick={onTextClick}>
                <Text color="text-white" className="mb-1">
                    Sort &amp; Filter
                </Text>
                <DownArrowIcon />
            </div>
            {isOpen && <SortFilter mobile />}
            {isOpen && filters.map((filter, idx) => <FilterGroup key={idx} mobile {...filter} />)}
        </>
    );
};

const Filters: FC<Props> = ({ filters, mobile = false }) => {
    return mobile ? <MobileFilters filters={filters} /> : <DesktopFilters filters={filters} />;
};

export default Filters;
