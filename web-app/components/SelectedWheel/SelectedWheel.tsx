import React, { FC, useContext } from 'react';
import { useRouter } from 'next/router';

import { constructWheelDimension, calculateSoldAsQuantityTextFromParams } from '../../utils';

import { SelectedWheelContext } from './Context';
import BarLoader from '../Loading';
import WhiteBox from '../WhiteBox';
import Text from '../Text';
import { ShortenedProductTitle, ProductImage, ProductLink } from '../Product';
import Price from '../Price';

const SelectedWheel: FC = () => {
    const { query } = useRouter();
    const { wheel, isLoading } = useContext<SelectedWheel.Context>(SelectedWheelContext);

    const Loaded = (): JSX.Element => {
        const {
            name,
            slug,
            price,
            featured_image,
            metadata,
            quantity_sold_in,
            sold_as_truck_set,
        } = wheel as WordPress.Product;

        // TODO: could make this into a skeleton type loader instead of just the bar..
        return (
            <ProductLink slug={slug} includeQueryParams>
                <div className="flex px-5">
                    <div className="w-1/3">
                        <ProductImage image={featured_image} wrapperClassName="w-20 h-20 relative" />
                    </div>
                    <div className="w-2/3">
                        <ShortenedProductTitle title={name} />
                        <Text>{constructWheelDimension(metadata as WordPress.WheelMetadata)}</Text>
                        <Text>{calculateSoldAsQuantityTextFromParams(quantity_sold_in, sold_as_truck_set, query)}</Text>
                        <Price price={price} />
                    </div>
                </div>
            </ProductLink>
        );
    };

    const showLoading = isLoading || wheel === null;

    return (
        <WhiteBox className="py-5">{showLoading ? <BarLoader showCog={false} paddingY="py-0" /> : <Loaded />}</WhiteBox>
    );
};

export default SelectedWheel;
