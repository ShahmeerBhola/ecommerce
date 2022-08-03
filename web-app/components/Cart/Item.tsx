import React, { FC, useContext } from 'react';
import isEmpty from 'lodash/isEmpty';

import { constructTruckTitle, calculateSoldAsQuantityText, numberWithCommas } from '../../utils';

import { ProductImage, ProductLink, ShortenedProductTitle } from '../Product';

import WhiteBox from '../WhiteBox';
import Text from './ItemText';
import Size from './ItemSize';
import Attributes from './ItemAttributes';
import NumberInput from '../Form/NumberInput';
import { SmallCloseIcon } from '../Icons';
import Price from '../Price';

import { CartContext } from './';

export type Props = {
    item: Cart.HydratedLineItem;
    hideQuantity?: boolean;
    showQuantityUnderTitle?: boolean;
    hideDelete?: boolean;
    onDeleteClick?: () => void;
    includeWhiteBox?: boolean;
    className?: string;
    compact?: boolean;
};

const Item: FC<Props> = ({
    item: {
        price,
        sale_price,
        name,
        id,
        slug,
        featured_image,
        quantity,
        quantity_sold_in,
        sold_as_truck_set,
        metadata,
        categories,
        truck,
        attributes,
        parent,
    },
    hideDelete = false,
    hideQuantity = false,
    showQuantityUnderTitle = false,
    onDeleteClick,
    includeWhiteBox = true,
    className,
    compact = false,
}) => {
    const { updateLineItemQuantity, deleteLineItem } = useContext<Cart.Context>(CartContext);

    const confirmDeleteLineItem = (): void => {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            if (onDeleteClick) {
                onDeleteClick();
            } else {
                deleteLineItem(id, truck);
            }
        }
    };

    let productImageClasses = 'w-full md:h-20 p-3 md:p-0';
    let productTitleClasses = 'ml-0 md:ml-5 truncate overflow-hidden';

    productImageClasses += compact ? ' md:w-1/5' : ' md:w-1/6 lg:w-1/8';
    productTitleClasses += compact ? ' md:w-4/5' : ' md:w-5/6 lg:w-7/8';

    const CloseIcon: FC<{ className: string }> = ({ className }) => (
        <SmallCloseIcon className={className} onClick={confirmDeleteLineItem} />
    );

    const variantID = !isEmpty(parent) ? `${id}` : '';
    const productSlug = !isEmpty(parent) ? parent?.slug || '' : slug;

    const Inner = (): JSX.Element => (
        <>
            <div className="flex flex-wrap md:flex-row relative items-center w-full md:w-2/3">
                {!hideDelete && <CloseIcon className="block md:hidden absolute right-0 top-0" />}
                <div className={productImageClasses}>
                    <ProductLink slug={productSlug} variant={variantID}>
                        <ProductImage image={featured_image} wrapperClassName="w-full h-full" />
                    </ProductLink>
                </div>
                <div className={productTitleClasses}>
                    <ProductLink slug={productSlug} variant={variantID}>
                        <ShortenedProductTitle title={name} fontWeight="font-medium" uppercase={false} />
                    </ProductLink>
                    {showQuantityUnderTitle && (
                        <div className="flex items-center">
                            <Text className="mr-1">Quantity: </Text>
                            <Text weight="font-medium">{numberWithCommas(quantity.toString())}</Text>
                        </div>
                    )}
                    {truck !== null ? (
                        <>
                            <Text color="text-black" className="mt-2">
                                {constructTruckTitle(truck)}
                            </Text>
                            <Text color="text-black" size="text-xs">
                                Sold as:{' '}
                                <span className="weight-bold">
                                    {calculateSoldAsQuantityText(quantity_sold_in, sold_as_truck_set, truck.addSpare)}
                                </span>
                            </Text>
                        </>
                    ) : null}
                    <Attributes items={attributes} parent={parent} />
                    <Size metadata={metadata} categories={categories} />
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between w-full md:w-1/3">
                {!hideQuantity && (
                    <div className="flex md:block justify-between w-full md:w-1/6 mt-3 md:mt-0">
                        <Text className="mb-3">Quantity</Text>
                        <NumberInput
                            value={quantity}
                            onChange={(num: number | string | undefined): void => {
                                if (typeof num === 'number') {
                                    if (num === 0) {
                                        confirmDeleteLineItem();
                                    } else {
                                        updateLineItemQuantity(id, num, truck);
                                    }
                                }
                            }}
                        />
                    </div>
                )}
                <div className="flex flex-grow md:block justify-between w-full md:w-1/6 text-right">
                    <Text className="block md:hidden">Price</Text>
                    <Price price={price} salePrice={sale_price} showDecimal />
                </div>
                {!hideDelete && <CloseIcon className="hidden md:block w-1/12 ml-10" />}
            </div>
        </>
    );

    const wrapperClassName = `flex flex-wrap items-center ${className}`;

    if (includeWhiteBox) {
        return (
            <WhiteBox className={wrapperClassName}>
                <Inner />
            </WhiteBox>
        );
    }
    return (
        <div className={wrapperClassName}>
            <Inner />
        </div>
    );
};

export default Item;
