import React, { FC, useContext } from 'react';
import isEmpty from 'lodash/isEmpty';

import { CartContext } from '../Cart';
import Text from '../Text';
import WhiteBox from '../WhiteBox';
import { formatPrice } from '../../utils';

const WheelTirePackageDiscount: FC = () => {
    const { wheelTirePackages } = useContext<Cart.Context>(CartContext);

    if (isEmpty(wheelTirePackages)) {
        return null;
    }

    return (
        <WhiteBox className="p-5 my-3">
            <Text color="text-black">
                Your order is eligible for a {formatPrice(100)} discount if picked up locally. Just select &quot;Local
                pickup&quot; as the shipping method!
            </Text>
        </WhiteBox>
    );
};

export default WheelTirePackageDiscount;
