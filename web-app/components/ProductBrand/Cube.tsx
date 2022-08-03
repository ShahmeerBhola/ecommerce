import React from 'react';
import Link from 'next/link';
import WhiteBox from '../WhiteBox';
import { constructUrl } from '../../utils';
import isEmpty from 'lodash/isEmpty';

type Props = {
  brand: WordPress.ProductBrand;
  linkCategorySlug: string;
};

const Cube: React.FunctionComponent<Props> = ({ brand: { name, slug, image }, linkCategorySlug }) => {
  const BrandImage = (): JSX.Element => {
    const { src, alt } = image as WordPress.Image;
    return <img src={src} alt={alt} className="max-h-6" />;
  };

  const BrandBackupText = (): JSX.Element => (
    <span className="block uppercase font-bold text-xl text-black py-10 px-5">{name}</span>
  );

  return (
    <div className="flex flex-grow p-2 box-border w-full md:w-1/2 lg:w-1/3 max-w-auto md:max-w-1/2 lg:max-w-1/3">
      <WhiteBox className="flex flex-grow px-5 py-8 justify-center text-center">
        <Link href={constructUrl({ page: 'category', extra: `${linkCategorySlug}/${slug}` })}>
          <a className="flex justify-center items-center">{isEmpty(image) ? <BrandBackupText /> : <BrandImage />}</a>
        </Link>
      </WhiteBox>
    </div>
  );
};

export default Cube;
