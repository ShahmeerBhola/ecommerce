import React from 'react';
import Text from '../Text';
import { formatPrice as _formatPrice, formatVariationsPrice, productHasPriceRange } from '../../utils';

import './price.scss';

export type Props = {
    size?: Styles.FontSizes;
    weight?: Styles.FontWeights;
    price: number;
    salePrice?: number;
    variations?: WordPress.ProductVariation[];
    hideVariationPricing?: boolean;
    showDecimal?: boolean;
};

const Price: React.FunctionComponent<Props> = ({
    price,
    salePrice,
    variations,
    hideVariationPricing = false,
    weight = 'font-medium',
    size = 'text-base',
    showDecimal,
}) => {
    const formatPrice = (_price: number): string => _formatPrice(_price, showDecimal);

    const determinePriceString = (): string => {
        if (!hideVariationPricing && variations && productHasPriceRange(variations)) {
            return formatVariationsPrice(variations);
        }
        return formatPrice(price);
    };

    const NormalPrice = (): JSX.Element => (
        <Text color="text-red-100" weight={weight} size={size} className="product-price">
            {determinePriceString()}
        </Text>
    );

    const SalePrice = (): JSX.Element => (
        <div className="on-sale-price items-center">
            <Text color="text-gray-100" weight={weight} size="text-sm" className="regular-price inline-block">
                {formatPrice(price)}
            </Text>
            <Text color="text-red-100" weight={weight} size={size} className="sale-price">
                {formatPrice(salePrice as number)}
            </Text>
        </div>
    );

    if (salePrice && salePrice !== price) {
        return <SalePrice />;
    }
    return <NormalPrice />;
};

export default Price;
