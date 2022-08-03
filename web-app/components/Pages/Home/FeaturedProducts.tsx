import React, { FC } from 'react';

import Text from '../../Text';
import { RedDivider } from '../../Divider';
import Slider from '../../Slider';
import FeaturedProduct from '../../FeaturedProduct';

type Props = {
    products: WordPress.Product[];
};

const SLIDER_CONFIG = [
    {
        breakpoint: 1280,
        settings: {
            slidesToShow: 4,
        },
    },
    {
        breakpoint: 1024,
        settings: {
            slidesToShow: 3,
        },
    },
    {
        breakpoint: 768,
        settings: {
            slidesToShow: 2,
        },
    },
    {
        breakpoint: 640,
        settings: {
            slidesToShow: 1,
        },
    },
];

export const FeaturedProducts: FC<Props> = ({ products }) => {
    return (
        <div className="mb-10">
            <Text h2 className="text-center sm:text-left">
                Top 20 Most Popular Wheels
            </Text>
            <RedDivider mx="mx-auto" my="my-5" className="sm:mx-0" />
            <Slider autoplay autoplaySpeed={2000} infinite={products.length > 1} responsive={SLIDER_CONFIG}>
                {products.map((product) => (
                    <div key={product.slug} className="px-2 h-full">
                        <FeaturedProduct product={product} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};
