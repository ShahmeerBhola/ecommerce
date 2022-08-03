import React from 'react';
import config from '../../config';

type Props = {
  onClick: () => void;
};

const RightCarrot: React.FunctionComponent<Props> = ({ onClick }) => {
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
      <path d="M18 15.5L2.84783 30L1 28.2317L14.3043 15.5L1 2.76829L2.84783 1L18 15.5Z" fill={red100} stroke={red100} />
    </svg>
  );
};

export default RightCarrot;
