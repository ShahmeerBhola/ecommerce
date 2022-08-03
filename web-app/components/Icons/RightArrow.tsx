import React from 'react';
import config from '../../config';

const RightArrow: React.FunctionComponent = () => {
  const red100 = config.colors['red-100'];
  return (
    <svg width="30" height="30" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="48" height="48" stroke={red100} strokeWidth="2" />
      <path
        d="M30.0168 31L28.2218 29.2L31.201 26.2125L14 26.2125L14 23.6669L31.0807 23.6669L28.2218 20.8L30.0168 19L36 25L30.0168 31Z"
        fill={red100}
      />
    </svg>
  );
};

export default RightArrow;
