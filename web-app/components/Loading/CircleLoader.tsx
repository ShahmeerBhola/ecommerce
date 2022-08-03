import React from 'react';
import BounceLoader from 'react-spinners/BounceLoader';
import config from '../../config';

type Props = {
  width?: string;
};

const Loading: React.FunctionComponent<Props> = ({ width = '20px' }) => (
  <BounceLoader color={config.colors['red-100']} size={width} />
);

export default Loading;
