import React from 'react';

type Props = {
    className?: string;
};

const WhiteBox: React.FunctionComponent<Props> = ({ children, className }) => (
    <div className={`bg-white border border-gray-80 border-solid shadow-sm ${className}`}>{children}</div>
);

export default WhiteBox;
