import React from 'react';
import Link from 'next/link';
import config from '../../config';
import { constructUrl } from '../../utils';

type Props = {
  renderLink?: boolean;
};

const Logo: React.FunctionComponent<Props> = ({ renderLink = true }) => {
  const Image = (): JSX.Element => (
    <img className="mx-auto" src="/images/logo.png" alt={config.siteName} width={140} height={70} />
  );

  if (renderLink) {
    return (
      <Link href={constructUrl({ page: '' })}>
        <a>
          <Image />
        </a>
      </Link>
    );
  }
  return <Image />;
};

export default Logo;
