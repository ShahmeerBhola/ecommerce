import React, { FC, HTMLAttributes, useState, useContext, useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';

import { ProductContext } from './Context';

import Slider from '../../Slider';
import ProductImage from '../Image';

const ProductGallery: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    const {
        state: { product, variation },
    } = useContext(ProductContext);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    const { featured_image, gallery_images = [] } = product as WordPress.Product;
    const { featured_image: variationImage } = variation || {};
    const productImages = [featured_image, ...gallery_images].filter(Boolean);
    const variationImages = [variationImage || featured_image].filter(Boolean);
    const images = !isEmpty(variation) ? variationImages : productImages;
    const activeImage = images[activeImageIndex];

    useEffect(() => {
        setActiveImageIndex(0);
    }, [variation]);

    return (
        <div {...props}>
            <ProductImage
                key={activeImageIndex}
                image={activeImage}
                wrapperClassName="w-auto h-auto sm:w-450px sm:h-450px mx-auto mb-3"
            />
            {images.length > 1 && (
                <Slider infinite={images.length > 4} slidesToShow={4} className="mb-5 lg:mb-20">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            onClickCapture={(): void => setActiveImageIndex(index)}
                            className={index === activeImageIndex ? 'opacity-50' : ''}
                        >
                            <ProductImage image={image} wrapperClassName="px-2 h-90px w-auto mx-auto" />
                        </div>
                    ))}
                </Slider>
            )}
        </div>
    );
};

export default ProductGallery;
