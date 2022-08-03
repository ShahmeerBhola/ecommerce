import React from 'react';
import Text from '../Text';

type Props = {
  className?: string;
  height?: 'h-4';
  width?: 'w-4';
  fontSize?: Styles.FontSizes;
};

const Circle: React.FunctionComponent<Props> = ({
  children,
  className,
  height = 'h-4',
  width = 'w-4',
  fontSize = 'text-xs',
}) => {
  const baseClasses = `rounded-full ${height} ${width} bg-red-200 text-white flex items-center justify-center`;
  const classes = `${baseClasses} ${className}`;
  return (
    <div className={classes}>
      <Text size={fontSize} color="text-white">
        {children}
      </Text>
    </div>
  );
};

export default Circle;
