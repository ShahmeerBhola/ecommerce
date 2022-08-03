import React, { FC } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

import { productHasVariations, productIsWheel, productIsTire, hasSelectedWheelQueryParam } from '../../utils';
import { ProductImage, ProductLink, ProductMetadata } from '../Product';
import ShortenedTitle from '../Product/ShortenedTitle';
import WhiteBox from '../WhiteBox';
import Price from '../Price';
import { AddToCartIcon, RightArrowIcon } from '../Icons';

type Props = {
    product: WordPress.Product;
};

type LinkProps = {
    className?: string;
    slug: string;
};

const Link: FC<LinkProps> = ({ className, children, slug }) => {
    const isPackage = slug.search('package') > -1;

    if (isPackage) {
        return (
            <NextLink href={`slug`}>
                <a>{children}</a>
            </NextLink>
        );
    }

    return (
        <ProductLink className={className} slug={slug} includeQueryParams>
            {children}
        </ProductLink>
    );
};

const SearchResult: FC<Props> = ({ product }) => {
    const { query } = useRouter();
    const { id, name, slug, price, sale_price, featured_image, variations, categories, is_purchasable } = product;
    const hasVariations = productHasVariations(product);
    const isWheel = productIsWheel(categories);
    const isTire = productIsTire(categories);
    const hasSelectedWheel = hasSelectedWheelQueryParam(query);
    const displayAddToCartButton = is_purchasable && !hasVariations && !isWheel && !(isTire && hasSelectedWheel);

    const productURL = hasSelectedWheel ? `/package?wheel=${query.selected_wheel}&tire=${id}` : slug;

    return (
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 border-transparent border-r-0 md:border-r-8 border-t-4 border-b-4">
            <WhiteBox className="flex flex-col justify-around h-full p-4 relative">
                <Link slug={productURL}>
                    <ProductImage
                        image={featured_image}
                        wrapperClassName="w-full h-72 lg:h-56"
                        lazyLoadProps={{ once: true, offset: 150 }}
                    />
                </Link>
                <Link slug={productURL}>
                    <ShortenedTitle title={name} className="mt-5" />
                </Link>
                <div className="flex items-center justify-between my-2">
                    <Price price={price} salePrice={sale_price} variations={variations} />
                    <div>
                        <Link slug={productURL} className={`inline-block${displayAddToCartButton ? ' mr-1' : ''}`}>
                            <RightArrowIcon />
                        </Link>
                        {displayAddToCartButton && <AddToCartIcon product={product} />}
                    </div>
                </div>
                <div className="flex flex-col">
                    <ProductMetadata product={product} />
                </div>
            </WhiteBox>
        </div>
    );
};

export default SearchResult;
