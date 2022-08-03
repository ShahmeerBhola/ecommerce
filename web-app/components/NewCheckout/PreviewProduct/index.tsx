import React, { FC } from 'react';
import isEmpty from 'lodash/isEmpty';

import { determineProductVariationFeaturedImage, calculateProductVariationPrice } from '../../../utils';
import { ProductImage } from '../../../components/Product';
import Text from '../../../components/Text';
import Price from '../../../components/Price';

type ProductDescriptionProps = {
    product: WordPress.Product;
    className?: string;
};

const ProductPreview: FC<ProductDescriptionProps> = ({ product }) => {
    const featuredImage = determineProductVariationFeaturedImage(product, null);
    return (
        <ProductImage
            image={featuredImage}
            wrapperClassName="w-auto h-auto mx-auto mb-8"
            style={{ maxHeight: '350px' }}
        />
    );
};

const ProductDescription: FC<ProductDescriptionProps> = ({ product: { description, ...rest }, className }) => {
    const metadata = rest.metadata as StringMap;
    return (
        <div className={className}>
            {description && (
                <>
                    <Text weight="font-bold" color="text-red-100" className="uppercase my-5">
                        Description
                    </Text>
                    <div
                        className="font-primary font-normal text-gray-100 text-sm mb-5"
                        dangerouslySetInnerHTML={{ __html: description }}
                    ></div>
                </>
            )}
            {Object.keys(metadata).map((key) => (
                <div className="flex py-1" key={key}>
                    <Text size="text-sm" className="w-1/2">
                        {key}:
                    </Text>
                    <Text size="text-sm" color="text-black" className="w-1/2 text-right">
                        {metadata[key]}
                    </Text>
                </div>
            ))}
        </div>
    );
};

const ProductTitle: FC<ProductDescriptionProps> = ({ product }) => {
    const { name, variations } = product;
    const { price, sale_price } = calculateProductVariationPrice(product, null);

    return (
        <div className="flex justify-between font-semibold border-b pb-8 mb-8 border-gray-80 space-x-3">
            <h3>{name}</h3>
            <Price price={price} salePrice={sale_price} variations={variations} />
        </div>
    );
};

export const PreviewProduct: FC<{ product: WordPress.Product | {} }> = ({ product }) => {
    // TODO Maybe fallback?
    if (isEmpty(product)) return null;

    const prd = product as WordPress.Product;

    return (
        <div>
            <ProductPreview product={prd} />
            <ProductTitle product={prd} />
            <ProductDescription product={prd} />
        </div>
    );
};
