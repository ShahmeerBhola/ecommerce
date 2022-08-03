import React, { FC } from 'react';

import ProductTitle from './Title';
import ProductPrice from './Price';
import ProductGallery from './Gallery';
import ProductDescription from './Description';
import ProductInfo from './Info';
import ProductAttributes from './Attributes';
import ProductNotice from './Notice';
import ProductAddToCart from './AddToCart';

type Props = {};

const PageContent: FC<Props> = () => {
    return (
        <div className="container mx-auto flex flex-grow flex-wrap py-10 px-5 lg:px-0 items-top justify-between">
            <div className="w-full lg:w-1/2">
                <ProductGallery />
                <ProductDescription className="hidden lg:block" />
            </div>
            <div className="w-full lg:w-2/5">
                <ProductTitle />
                <ProductPrice className="mt-2" />

                <ProductInfo className="mt-5" />
                <ProductAttributes className="mt-5" />
                <ProductNotice className="mb-5" />

                <ProductDescription className="block lg:hidden mb-5" />
                <ProductAddToCart className="mt-5" />
            </div>
        </div>
    );
};

export default PageContent;
