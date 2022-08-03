import React, { FC, useState, useEffect } from 'react';

import WordPressClient from '../../../utils/clients/wordpress';

import Text from '../../Text';
import Container from '../../Container';
import { RedDivider } from '../../Divider';
import { MagnifyingGlassIcon } from '../../Icons';
import ProductCategoryCubes from '../../ProductCategory';

export const NoProducts: FC = () => {
    const [categories, updateCategories] = useState<WordPress.ProductCategory[]>([]);

    useEffect(() => {
        const fetchCategories = async (): Promise<void> => {
            const productCategories = await WordPressClient.getProductCategories();
            updateCategories(productCategories);
        };

        fetchCategories();
    }, []);

    return (
        <Container>
            <div className="flex flex-col">
                <div className="flex flex-wrap items-center my-5">
                    <MagnifyingGlassIcon large />
                    <Text className="ml-5">No results were found for your search</Text>
                </div>
                <Text color="text-black" weight="font-bold" size="text-2xl" className="uppercase mt-10">
                    Try Searching By Category
                </Text>
                <RedDivider mx="mx-0" my="my-5" />
                <ProductCategoryCubes categories={categories} />
            </div>
        </Container>
    );
};
