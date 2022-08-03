import React, { FC } from 'react';
import { useRouter } from 'next/router';
import Text from '../Text';
import { RightCarrotIcon, LeftCarrotIcon } from '../Icons';
import { modifyQueryParam, calculatePageNumbersToShow } from '../../utils';
import config from '../../config';

type Props = {
    pagination: WordPress.Pagination;
};

const Pagination: FC<Props> = ({ pagination: { total_pages, page } }) => {
    const router = useRouter();
    const { paginationPagesToShow } = config;
    const numbersToShow = calculatePageNumbersToShow(total_pages, page);

    const changePage = (page: number): void => modifyQueryParam(router, 'page', page.toString());

    if (numbersToShow.length === 0) {
        return null;
    }

    return (
        <div className="inline-flex items-center float-right">
            <Text className="mr-5" size="text-sm">
                Page
            </Text>
            {page !== 1 && total_pages > paginationPagesToShow ? (
                <div className="mx-3">
                    <LeftCarrotIcon onClick={(): void => changePage(page - 1)} />
                </div>
            ) : null}
            {numbersToShow.map((number) => {
                const isActive = number === page;
                return (
                    <div
                        className={`mx-1 py-1 px-3 cursor-pointer${
                            isActive ? ' bg-white border border-gray-80 border-solid' : ''
                        }`}
                        key={number}
                        onClick={(): void => changePage(number)}
                    >
                        <Text size="text-sm" color={isActive ? 'text-red-100' : 'text-gray-100'}>
                            {number}
                        </Text>
                    </div>
                );
            })}
            {page !== total_pages && total_pages > paginationPagesToShow ? (
                <div className="mx-3">
                    <RightCarrotIcon onClick={(): void => changePage(page + 1)} />
                </div>
            ) : null}
        </div>
    );
};

export default Pagination;
