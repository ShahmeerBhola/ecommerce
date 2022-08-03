import React from 'react';
import config from '../../config';

const DownArrow: React.FunctionComponent = () => {
  const { white } = config.colors;
  return (
    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 6L11 0.652175L10.3293 8.95037e-07L5.5 4.69565L0.670731 5.06609e-08L-4.86153e-07 0.652174L5.5 6Z"
        fill={white}
      />
    </svg>
  );
};

export default DownArrow;
