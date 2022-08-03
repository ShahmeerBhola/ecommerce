import React from 'react';
import Button from '../Button';
import WhiteBox from '../WhiteBox';
import { ShortenedProductTitle, ProductImage } from '../Product';
import { constructUrl } from '../../utils';

type Props = {
    product: WordPress.Product;
};

const FeaturedProduct: React.FunctionComponent<Props> = ({ product: { name, featured_image } }) => (
    <WhiteBox className="h-full p-5 flex flex-col justify-between text-center">
        <ShortenedProductTitle title={name} />
        <ProductImage
            image={featured_image}
            wrapperClassName="w-full h-56 lg:h-40 my-10"
            lazyLoadProps={{ once: true, offset: 300 }}
        />
        <Button
            inverted
            link={constructUrl({ page: 'category', extra: 'wheels', queryParams: { s: name } })}
            paddingX="px-2"
            textSize="text-xs"
        >
            See {name} Wheels
        </Button>
    </WhiteBox>
);

export default FeaturedProduct;
