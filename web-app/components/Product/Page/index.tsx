import React, { FC } from 'react';

import WheelTirePackageBanner from '../../WheelTirePackageBanner';

import PageLayout from './Layout';
import ProductContent from './Content';

const ProductPage: FC = () => {
    return (
        <PageLayout>
            <WheelTirePackageBanner />
            <ProductContent />
        </PageLayout>
    );
};

export default ProductPage;
