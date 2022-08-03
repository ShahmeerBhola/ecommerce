import React from 'react';

export type Props = {
  className?: string;
  size?: Styles.FontSizes;
  color?: Styles.FontColors;
  weight?: Styles.FontWeights;
  h1?: boolean;
  h2?: boolean;
};

type CalculateClassNameInput = Omit<Props, 'h1' | 'h2'>;

const Text: React.FunctionComponent<Props> = ({ children, className, color, size, weight, h1 = false, h2 = false }) => {
  const calculateClassNames = ({
    color: defaultColor,
    size: defaultSize,
    weight: defaultWeight,
  }: CalculateClassNameInput): string => {
    const col = color || defaultColor;
    const siz = size || defaultSize;
    const weig = weight || defaultWeight;

    return `font-primary ${col} ${siz} ${weig} ${className}`;
  };

  if (h1) {
    return (
      <h1
        className={`${calculateClassNames({ color: 'text-black', size: 'text-5xl', weight: 'font-bold' })} uppercase`}
      >
        {children}
      </h1>
    );
  } else if (h2) {
    return (
      <h2
        className={`${calculateClassNames({
          color: 'text-gray-400',
          size: 'text-4xl',
          weight: 'font-bold',
        })} uppercase`}
      >
        {children}
      </h2>
    );
  }
  return (
    <p className={calculateClassNames({ color: 'text-gray-100', size: 'text-base', weight: 'font-normal' })}>
      {children}
    </p>
  );
};

export default Text;
