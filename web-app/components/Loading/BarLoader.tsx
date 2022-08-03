import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

import { CogIcon } from '../Icons';
import config from '../../config';

type Props = {
  showCog?: boolean;
  paddingY?: 'py-0' | 'py-5' | 'py-10' | 'py-40';
  className?: string;
  width?: number;
};

const Loading: React.FunctionComponent<Props> = ({ showCog = true, paddingY = 'py-40', width = 150, className }) => (
  <div className={`flex flex-col items-center ${paddingY} ${className}`}>
    {showCog && (
      <div className="pb-10">
        <CogIcon />
      </div>
    )}
    <BarLoader color={config.colors['red-100']} width={`${width}px`} />
  </div>
);

export default Loading;
