import React, { FC } from 'react';

import { useMediaQuery } from '../../../utils';

import Text from '../../Text';
import { PhotoContainer } from '../../Container';

const getBackground = (isPhoneView: boolean): string => {
    const imageName = isPhoneView ? 'home_truck-hero-mobile.jpg' : 'home_truck-hero.jpg';
    return `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.5)), url('images/${imageName}')`;
};

export const Hero: FC = ({ children }) => {
    const [isPhoneView] = useMediaQuery('(max-width: 640px)');
    const backgroundImage = getBackground(isPhoneView);

    return (
        <PhotoContainer
            className="relative flex items-center"
            containerPaddingY="py-56"
            backgroundStyles={{ backgroundImage }}
        >
            <div className="w-full lg:w-1/2">
                <Text h1 color="text-white">
                    Wheel and Tire Packages
                </Text>
                <Text size="text-xl" color="text-white" weight="font-medium" className="mt-5">
                    $100 off Wheel & Tire Packages when picked up locally
                </Text>
            </div>
            {children}
        </PhotoContainer>
    );
};
