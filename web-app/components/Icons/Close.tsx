import React from 'react';
import config from '../../config';

type Props = {
    className?: string;
    onClick: () => void;
};

const Close: React.FunctionComponent<Props> = ({ onClick, className }) => (
    <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`cursor-pointer ${className}`}
        onClick={onClick}
    >
        <path
            d="M26 3.71429L22.2857 0L13 9.28572L3.71429 0L0 3.71429L9.28572 13L0 22.2857L3.71429 26L13 16.7143L22.2857 26L26 22.2857L16.7143 13L26 3.71429Z"
            fill={config.colors.black}
        />
    </svg>
);

export default Close;
