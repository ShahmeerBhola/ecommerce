import React, { FC } from 'react';

import LineItems from './LineItems';
import WheelTirePackages from './WheelTirePackages';

export type Props = {
    hideQuantity?: boolean;
    showQuantityUnderTitle?: boolean;
    hideDelete?: boolean;
    compact?: boolean;
};

const Content: FC<Props> = ({
    hideDelete = false,
    hideQuantity = false,
    showQuantityUnderTitle = false,
    compact = false,
}) => {
    return (
        <>
            <WheelTirePackages hideDelete={hideDelete} compact={compact} />
            <LineItems
                hideDelete={hideDelete}
                hideQuantity={hideQuantity}
                showQuantityUnderTitle={showQuantityUnderTitle}
                compact={compact}
            />
        </>
    );
};

export default Content;
