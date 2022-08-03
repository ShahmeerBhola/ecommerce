import React from 'react';
import PulseLoader from 'react-spinners/PulseLoader';
import config from '../../config';

type Props = {
  width?: string;
};

const Loading: React.FunctionComponent<Props> = ({ width = '10px' }) => (
  <PulseLoader color={config.colors['red-100']} size={width} />
);

export default Loading;
