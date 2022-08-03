import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

import { productHasVariations, productIsWheel, productIsTire, hasSelectedWheelQueryParam } from '../../../../utils';
import { ProductImage, ProductLink } from '../../../Product';
import ShortenedTitle from '../../../Product/ShortenedTitle';
import WhiteBox from '../../../WhiteBox';
import Price from '../../../Price';
import { AddToCartIcon, RightArrowIcon } from '../../../Icons';

type Props = {
    isActive: boolean;
    product: WordPress.Product;
    style?: React.CSSProperties;
    onToggleVariations?: () => void;
};

type LinkProps = {
    className?: string;
    slug: string;
    variant?: string;
};

type ProductMetadataProps = {
    items: StringMap[];
};

type VariationCardProps = {
    product: WordPress.ProductBase;
    parentProduct: WordPress.Product;
    style?: React.CSSProperties;
    isMini?: boolean;
};

const Link: FC<LinkProps> = ({ className, children, slug, variant }) => {
    const isPackage = slug.search('package') > -1;

    if (isPackage) {
        return (
            <NextLink href={`slug`}>
                <a>{children}</a>
            </NextLink>
        );
    }

    return (
        <ProductLink className={className} slug={slug} variant={variant} includeQueryParams>
            {children}
        </ProductLink>
    );
};

const Meta: FC<ProductMetadataProps> = ({ items }) => {
    return (
        <div className="flex flex-col text-sm text-gray-200 divide-y divide-gray-80 divide-solid">
            {items.map(({ label, value }, index) => (
                <div key={index} className="flex justify-between py-2">
                    <div className="capitalize mr-2">{label}</div>
                    <div className="text-gray-300 font-bold">{value}</div>
                </div>
            ))}
        </div>
    );
};

const ProductMeta: FC<{ product: WordPress.Product }> = ({ product }) => {
    const [items, setItems] = useState<ProductMetadataProps['items']>([]);

    useEffect(() => {
        const { brand, _attributes } = product;
        const { pa_diameter, pa_width } = _attributes || {};
        let metaItems: StringMap[] = [];

        if (brand) {
            metaItems = [{ label: 'Brand', value: brand.name }, ...metaItems];
        }

        for (const attribute of [pa_diameter, pa_width]) {
            if (attribute && attribute.options.length) {
                const values = attribute.options.map((item: string) => `${item}"`);
                metaItems = [...metaItems, { label: attribute.title, value: values.join(', ') }];
            }
        }

        if (metaItems.length) {
            setItems(metaItems);
        }
    }, [product]);

    return <Meta items={items} />;
};

const VariationMeta: FC<{
    product: WordPress.ProductBase;
    parentProduct: WordPress.Product;
    isMini?: boolean;
}> = ({ product, parentProduct, isMini }) => {
    const [items, setItems] = useState<ProductMetadataProps['items']>([]);

    useEffect(() => {
        const { _attributes = {}, brand } = parentProduct;
        const {
            attributes: { pa_diameter, pa_width, pa_wheel_offset, pa_color, pa_bolt_pattern },
        } = product as WordPress.ProductVariation;

        let metaItems: StringMap[] = [];

        if (pa_diameter || pa_width || pa_wheel_offset) {
            const value = [pa_diameter, pa_width, pa_wheel_offset]
                .filter(Boolean)
                .map((el) => `${el}"`)
                .join(' x ');
            metaItems = [{ label: 'Dimension', value }, ...metaItems];
        }

        if (!isMini && brand) {
            metaItems = [{ label: 'Brand', value: brand.name }, ...metaItems];
        }

        for (const [key, value] of Object.entries({ pa_bolt_pattern, pa_color })) {
            if (value) {
                const label = (_attributes[key] || {}).title || '';
                metaItems = [...metaItems, { label, value }];
            }
        }

        if (metaItems.length) {
            setItems(metaItems);
        }
    }, [product]);

    return <Meta items={items} />;
};

export const ProductCard: FC<Props> = ({ product, onToggleVariations, isActive, ...rest }) => {
    const { query } = useRouter();
    const { id, name, slug, price, sale_price, featured_image, variations, categories, is_purchasable } = product;
    const hasVariations = productHasVariations(product);
    const isWheel = productIsWheel(categories);
    const isTire = productIsTire(categories);
    const hasSelectedWheel = hasSelectedWheelQueryParam(query);
    const displayAddToCartButton = is_purchasable && !hasVariations && !isWheel && !(isTire && hasSelectedWheel);

    const productURL = hasSelectedWheel ? `/package?wheel=${query.selected_wheel}&tire=${id}` : slug;

    const activeClass = isActive ? 'sos-prod__active' : '';

    return (
        <div className={`w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-1 ${activeClass}`} {...rest}>
            <WhiteBox className="flex flex-col h-full p-4 relative">
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

                <ProductMeta product={product} />

                {!!variations.length ? (
                    <div
                        className="text-red-100 text-center mt-auto cursor-pointer select-none pt-2"
                        onClick={onToggleVariations}
                    >
                        {isActive ? 'Hide Options' : `${variations.length} Options Available`}
                    </div>
                ) : (
                    <div className="text-red-100 text-center mt-auto cursor-pointer select-none pt-2">
                        <Link slug={productURL}>View Product</Link>
                    </div>
                )}
            </WhiteBox>
        </div>
    );
};

export const VariationCard: FC<VariationCardProps> = ({ product, parentProduct, isMini, ...rest }) => {
    const { query } = useRouter();
    const { id, name, price, sale_price, featured_image } = product;
    const { slug } = parentProduct;
    const hasSelectedWheel = hasSelectedWheelQueryParam(query);

    const productURL = hasSelectedWheel ? `/package?wheel=${query.selected_wheel}&tire=${id}` : slug;
    const variantParam = `${id}`;

    return (
        <div className={`${isMini ? 'h-full' : ''} w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-1`} {...rest}>
            <WhiteBox className="flex flex-col h-full p-4 relative">
                <Link slug={productURL} variant={variantParam}>
                    <ProductImage
                        key={id}
                        image={featured_image}
                        wrapperClassName={`w-full ${isMini ? 'h-32 lg:h-40' : 'h-72 lg:h-56'}`}
                        lazyLoadProps={{ once: true, offset: 150 }}
                    />
                </Link>
                <Link slug={productURL} variant={variantParam}>
                    <ShortenedTitle title={name} className="mt-5" />
                </Link>
                <div className="flex items-center justify-between my-2">
                    <Price price={price} salePrice={sale_price} />
                    <div>
                        <Link slug={productURL} variant={variantParam} className="inline-block mr-1">
                            <RightArrowIcon />
                        </Link>
                    </div>
                </div>

                <VariationMeta product={product} parentProduct={parentProduct} isMini={isMini} />
                {!isMini && (
                    <div className="text-red-100 text-center mt-auto cursor-pointer select-none pt-2">
                        <Link slug={productURL} variant={variantParam}>
                            View Product
                        </Link>
                    </div>
                )}
            </WhiteBox>
        </div>
    );
};
