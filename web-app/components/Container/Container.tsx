import React from 'react';

export type Props = {
  className?: string;
  paddingY?: string;
  paddingX?: string;
  bgColor?: Styles.BackgroundColors;
  innerContainerClassName?: string;
};

const Container: React.FunctionComponent<Props> = ({
  children,
  className,
  paddingY = 'md:py-10 py-5',
  paddingX = 'px-5',
  bgColor,
  innerContainerClassName = '',
}) => {
  const baseClasses = className ? `${className} ` : '';
  const innerContainerClasses = `container mx-auto ${paddingX} ${paddingY} ${innerContainerClassName}`.trim();

  if (bgColor) {
    return (
      <div className={`${baseClasses}${bgColor}`}>
        <div className={innerContainerClasses}>{children}</div>
      </div>
    );
  }
  return <div className={`${baseClasses}${innerContainerClasses}`}>{children}</div>;
};

export default Container;
