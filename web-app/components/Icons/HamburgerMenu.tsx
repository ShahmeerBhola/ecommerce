import React from 'react';
import config from '../../config';

const { white } = config.colors;

type Props = {
  className?: string;
  onClick: () => void;
};

const HamburgerMenu: React.FunctionComponent<Props> = ({ className, onClick }) => (
  <svg
    width="35"
    height="33"
    viewBox="0 0 35 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    className={className}
  >
    <rect width="35" height="3" fill={white} />
    <rect y="15" width="35" height="3" fill={white} />
    <rect y="30" width="35" height="3" fill={white} />
  </svg>
);

export default HamburgerMenu;
