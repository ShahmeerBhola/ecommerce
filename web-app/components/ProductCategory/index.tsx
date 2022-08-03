import React, { FC } from 'react';
import Cube from './Cube';

type Props = {
    categories: WordPress.ProductCategory[];
};

const Cubes: FC<Props> = ({ categories }) => (
    <div className="flex flex-wrap w-full">
        {categories.map((category) => (
            <Cube key={category.slug} category={category} />
        ))}
    </div>
);

export default Cubes;
