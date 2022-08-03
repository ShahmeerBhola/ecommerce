import React from 'react';
import config from '../../config';

type Props = {
  onClick: () => void;
};

const LeftCarrot: React.FunctionComponent<Props> = ({ onClick }) => {
  const red100 = config.colors['red-100'];
  return (
    <svg
      className="cursor-pointer"
      onClick={onClick}
      width="19"
      height="31"
      viewBox="0 0 19 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 15.5L16.1522 30L18 28.2317L4.69565 15.5L18 2.76829L16.1522 1L1 15.5Z" fill={red100} stroke={red100} />
    </svg>
  );
};

export default LeftCarrot;
