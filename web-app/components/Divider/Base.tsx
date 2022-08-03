import React from 'react';

export type Props = {
  color?: 'bg-gray-80' | 'bg-red-100' | 'bg-gray-500';
  borderColor?: 'border-gray-80' | 'border-red-100' | 'border-gray-500';
  width?: 'w-20' | 'w-full';
  my?: 'my-0' | 'my-2' | 'my-4' | 'my-5' | 'my-6' | 'my-10';
  mx?: 'mx-0' | 'mx-auto';
  borderThickness?: 'border-1' | 'border-2';
  className?: string;
};

const BaseDivider: React.FunctionComponent<Props> = ({
  color = 'bg-red-100',
  borderColor = 'border-red-100',
  width = 'w-20',
  my = 'my-10',
  mx = 'mx-auto',
  borderThickness = 'border-2',
  className,
}) => {
  const classNames = `${my} ${width}${mx ? ` ${mx}` : ''} ${className}`;
  return <hr className={`${classNames} ${color} ${borderThickness} border-solid ${borderColor}`} />;
};

export default BaseDivider;
