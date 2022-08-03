import React from 'react';
import Cube from './Cube';

type Props = {
  brands: WordPress.ProductBrand[];
  linkCategorySlug: string;
};

const Cubes: React.FunctionComponent<Props> = ({ brands, linkCategorySlug }) => (
  <div className="flex flex-grow flex-wrap">
    {brands.map((brand) => (
      <Cube key={brand.slug} brand={brand} linkCategorySlug={linkCategorySlug} />
    ))}
  </div>
);

export default Cubes;
