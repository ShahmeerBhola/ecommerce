import React, { FC, HTMLAttributes, useContext } from 'react';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';

import {
    constructUrl,
    productIsWheel,
    productIsTire,
    hasSelectedWheelQueryParam,
    productHasVariations,
} from '../../../utils';

// import { ProductVariations as ProductVariationsDropdown } from '../../components/Product';
import { CartContext } from '../../Cart';
import Button from '../../Button';
import AddToCartButton from '../../AddToCartButton';
import { TruckRequiredForProductForm, WheelTirePackageForm } from '../../Forms';

import { ProductContext } from './Context';

const ProductAddToCart: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const router = useRouter();
    const { addLineItem } = useContext<Cart.Context>(CartContext);

    const {
        state: { product, queryParams, variation },
    } = useContext(ProductContext);

    const { id, is_purchasable, categories, truck_info_required_for_purchase } = product as WordPress.Product;
    const { year, make, model, trim } = queryParams;
    const truckFormProps = { year, make, model, trim };

    const isWheel = productIsWheel(categories);
    const isTire = productIsTire(categories);
    const hasVariations = productHasVariations(product as WordPress.Product);
    const hasActiveVariation = hasVariations && !isEmpty(variation);

    const hasSelectedWheelParam = hasSelectedWheelQueryParam(queryParams);
    const isWheelTirePackage = isTire && hasSelectedWheelParam;

    const addProductToCart = (): Promise<void> =>
        addLineItem((hasActiveVariation ? variation : product) as WordPress.Product);

    const continueToAddTires = (): void => {
        const pathname = constructUrl({ page: 'category', extra: 'tires' });
        const wheelID = !isEmpty(variation) ? variation.id : id;

        router.push({ pathname, query: { selected_wheel: wheelID } });
    };

    if (!is_purchasable) {
        return (
            <div {...props}>
                <Button className="w-full" disabled={true}>
                    Out of Stock
                </Button>
            </div>
        );
    }

    if (isWheel) {
        return (
            <div {...props}>
                <AddToCartButton
                    className="mt-2"
                    onClick={continueToAddTires}
                    inverted={false}
                    disabled={!hasActiveVariation}
                >
                    Continue to Add Tires
                </AddToCartButton>
                <AddToCartButton className="mt-2" onClick={addProductToCart} disabled={!hasActiveVariation}>
                    Buy without Tires
                </AddToCartButton>
            </div>
        );
    }

    if (truck_info_required_for_purchase) {
        return (
            <div {...props}>
                {/* {hasVariations && (
                    <ProductVariationsDropdown
                        product={product}
                        selectedVariant={product}
                        onVariantSelect={(): void => {
                            console.log('select variant');
                        }}
                        className={`mt-5 pb-2`}
                    />
                )} */}
                <TruckRequiredForProductForm
                    product={product as WordPress.ProductBase}
                    externalDisableSubmit={!hasActiveVariation}
                    {...truckFormProps}
                />
            </div>
        );
    }

    if (isWheelTirePackage) {
        return (
            <div {...props}>
                <WheelTirePackageForm tire={product as WordPress.Product} {...truckFormProps} />
            </div>
        );
    }

    // if (hasVariations) {
    //     return (
    //         <div {...props}>
    //             {/* <ProductVariations /> */}
    //             {/* <Variations product={product} /> */}
    //             <AddToCartButton className="mt-5" disabled={selectedVariantIsNull} onClick={addProductToCart} />
    //         </div>
    //     );
    // }

    return (
        <div {...props}>
            <AddToCartButton className="mt-5" disabled={!hasActiveVariation} onClick={addProductToCart} />
        </div>
    );
};

export default ProductAddToCart;
