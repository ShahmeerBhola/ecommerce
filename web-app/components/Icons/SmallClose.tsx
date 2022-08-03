import React from 'react';
import config from '../../config';

type Props = {
    className?: string;
    onClick?: () => void;
    fill?: string;
};

const SmallClose: React.FunctionComponent<Props> = ({ onClick, className, fill }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`cursor-pointer ${className}`}
        onClick={onClick}
    >
        <path
            d="M14 2L12 0L7 5L2 0L0 2L5 7L0 12L2 14L7 9L12 14L14 12L9 7L14 2Z"
            fill={fill || config.colors['gray-75']}
        />
    </svg>
);

export default SmallClose;
