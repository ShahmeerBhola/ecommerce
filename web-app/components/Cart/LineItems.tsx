import React, { FC, useContext } from 'react';

import { CartContext, CartItem } from './';
import { Props as CartContentProps } from './Content';
import ContentSection from './ContentSection';

const LineItems: FC<CartContentProps> = ({
    hideDelete,
    hideQuantity,
    showQuantityUnderTitle = false,
    compact = false,
}) => {
    const { lineItems } = useContext(CartContext);

    return lineItems.length > 0 ? (
        <ContentSection text="Your Items" compact={compact}>
            {lineItems.map((lineItem, idx) => (
                <CartItem
                    key={idx}
                    item={lineItem}
                    hideDelete={hideDelete}
                    hideQuantity={hideQuantity}
                    showQuantityUnderTitle={showQuantityUnderTitle}
                    className="p-5 my-2"
                    compact={compact}
                />
            ))}
        </ContentSection>
    ) : null;
};

export default LineItems;
