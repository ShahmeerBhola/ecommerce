import React, { FC } from 'react';
import { useRouter } from 'next/router';
import Text from '../../components/Text';
import Container from '../../components/Container';
import SelectedWheel from '../../components/SelectedWheel';
import { hasSelectedWheelQueryParam } from '../../utils';

type Props = {
    hideBanner?: boolean;
};

const WheelTirePackageBanner: FC<Props> = ({ hideBanner = false }) => {
    const { query } = useRouter();
    if (hasSelectedWheelQueryParam(query) && !hideBanner) {
        return (
            <Container bgColor="bg-gray-50" className="flex">
                <Text className="mb-3" color="text-black" weight="font-bold">
                    Your Package
                </Text>
                <div className="w-full md:w-1/3">
                    <SelectedWheel />
                </div>
            </Container>
        );
    }
    return null;
};

export default WheelTirePackageBanner;
