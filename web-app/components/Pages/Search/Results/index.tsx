import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { getQueryParams } from '../../../../utils';

import { ProductCard, VariationCard } from './ProductCard';
import { Variations } from './Variations';

import './styles.scss';

type Props = {
    products: WordPress.Product[];
};

const sanitizedProducts = (products: WordPress.Product[]): WordPress.Product[] => {
    let result: WordPress.Product[] = [];

    for (const product of products) {
        if (Array.isArray(product)) {
            result = [...result, ...product];
        } else {
            result = [...result, product];
        }
    }

    return result;
};

export const Results: FC<Props> = ({ products }) => {
    const [currentProduct, setCurrentProduct] = useState<WordPress.Product | null>(null);
    const [currentOrder, setCurrentOrder] = useState<number>(0);

    const [filteredProductVariation, setFilteredProductVariation] = useState<WordPress.Product[]>([]);

    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { page, ...queryParams } = getQueryParams(router);
        const globalFilters: StringMap = {};

        for (const key in queryParams) {
            globalFilters['pa_' + key] = queryParams[key].replace('"', '');
        }

        const newProducts = [...products].map((product) => {
            const newVariations = product.variations.filter((variation) => {
                const { attributes } = variation;
                return Object.entries(globalFilters).every(([key, value]) => {
                    return value === attributes[key];
                });
            });

            if (newVariations.length && newVariations.length < 5) {
                return newVariations.map((variation) => {
                    return {
                        ...variation,
                        parentProduct: product,
                    };
                });
            }

            return { ...product, variations: newVariations };
        });

        setFilteredProductVariation(sanitizedProducts(newProducts as WordPress.Product[]));
    }, [products]);

    const showVariations = (product: WordPress.Product, key: number): void => {
        if (currentProduct && product.id === currentProduct.id) {
            setCurrentProduct(null);
            setCurrentOrder(0);
        } else {
            setCurrentProduct(product);
            setCurrentOrder(key);
        }
    };

    const hideVariations = (): void => {
        setCurrentProduct(null);
        setCurrentOrder(0);
    };

    return (
        <div className="flex flex-wrap -m-1">
            {filteredProductVariation.map((product, key) => {
                const { parentProduct } = product as any;

                if (parentProduct) {
                    return (
                        <VariationCard
                            style={{ order: key + 1 }}
                            key={key}
                            product={product as WordPress.ProductBase}
                            parentProduct={parentProduct}
                        />
                    );
                }

                return (
                    <ProductCard
                        isActive={currentOrder === key + 1}
                        product={product}
                        key={key}
                        style={{ order: key + 1 }}
                        onToggleVariations={(): void => showVariations(product, key + 1)}
                    />
                );
            })}

            {!!currentProduct && (
                <Variations
                    style={{ order: Math.ceil(currentOrder / 4) * 4 }}
                    product={currentProduct}
                    onClose={hideVariations}
                />
            )}
        </div>
    );
};
