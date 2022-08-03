import React from 'react';
import Link from 'next/link';
import Text from '../Text';
import PhotoBackground from '../PhotoBackground';
import { constructUrl } from '../../utils';
import isEmpty from 'lodash/isEmpty';

type Props = {
  category: WordPress.ProductCategory;
};

const Cube: React.FunctionComponent<Props> = ({ category: { slug, name, image } }) => {
  const wrapperClassNames = 'flex justify-end items-end h-full w-full p-5 text-right';

  const Name = (): JSX.Element => (
    <Text color="text-white" className="uppercase" size="text-4xl" weight="font-bold">
      {name}
    </Text>
  );

  const Photo = (): JSX.Element => {
    const { src } = image as WordPress.Image;
    return (
      <PhotoBackground image={src} className={wrapperClassNames}>
        <Name />
      </PhotoBackground>
    );
  };

  const ColorBackground = (): JSX.Element => (
    <div className={`${wrapperClassNames} bg-gray-80`}>
      <Name />
    </div>
  );

  return (
    <div className="h-cube w-full p-2 box-border md:w-1/2 lg:w-1/3">
      <Link href={constructUrl({ page: 'category', extra: slug })}>
        <a>{isEmpty(image) ? <ColorBackground /> : <Photo />}</a>
      </Link>
    </div>
  );
};

export default Cube;
