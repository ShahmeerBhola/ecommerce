import React from 'react';
import config from '../../config';

type Props = {
  className?: string;
  onClick: () => void;
};

const ThinClose: React.FunctionComponent<Props> = ({ onClick, className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`cursor-pointer ${className}`}
    onClick={onClick}
  >
    <path
      d="M24 0.705882L23.2941 0L12 11.2941L0.705882 0L0 0.705882L11.2941 12L0 23.2941L0.705882 24L12 12.7059L23.2941 24L24 23.2941L12.7059 12L24 0.705882Z"
      fill={config.colors['gray-901']}
    />
  </svg>
);

export default ThinClose;
