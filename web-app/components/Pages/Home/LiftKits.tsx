import React, { FC } from 'react';

import { constructUrl } from '../../../utils';

import Text from '../../Text';
import { PhotoContainer } from '../../Container';
import Button from '../../Button';

export const LiftKits: FC = () => {
    return (
        <PhotoContainer
            image="home_truck-lift-kits.jpg"
            className="focus:text-center flex flex-col justify-center mb-10 lg:px-12"
            containerPaddingY="py-20 sm:py-56"
        >
            <Text h2 color="text-white" className="mb-5">
                Lift &amp; Leveling Kits
            </Text>
            <Button className="self-center" link={constructUrl({ page: 'category', extra: 'suspension' })}>
                Shop All Suspension Kits
            </Button>
        </PhotoContainer>
    );
};
