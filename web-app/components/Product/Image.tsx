import React, { FC, HTMLAttributes } from 'react';
import { LazyLoadProps } from 'react-lazyload';

import FallbackImage from '../FallbackImage';
import config from '../../config';

type Props = {
    image: WordPress.Image | null;
    wrapperClassName?: string;
    lazyLoadProps?: LazyLoadProps;
};

const fallbackSrc = config.product.placeholderImagePath;

const ProductImage: FC<Props & HTMLAttributes<HTMLImageElement>> = ({
    image,
    wrapperClassName,
    lazyLoadProps,
    ...rest
}) => (
    <div className={wrapperClassName}>
        <FallbackImage
            fallbackSrc={fallbackSrc}
            lazyLoadProps={lazyLoadProps}
            src={image ? image.src : fallbackSrc}
            alt={image ? image.alt : 'No Product Image Placeholder'}
            {...rest}
        />
    </div>
);

export default ProductImage;
