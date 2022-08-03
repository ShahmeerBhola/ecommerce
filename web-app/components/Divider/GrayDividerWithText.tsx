import React from 'react';
import Text from '../Text';
import { Props as TextProps } from '../Text';
import GrayDivider, { Props as GrayDividerProps } from './Gray';

export type Props = {
  text: string;
  options?: {
    text?: TextProps;
    divider?: GrayDividerProps;
  };
};

const GrayDividerWithText: React.FunctionComponent<Props> = ({ text, children, options }) => {
  return (
    <div className="flex w-full items-center">
      <Text {...(options?.text || {})}>{text}</Text>
      <GrayDivider {...(options?.divider || {})} />
      {children}
    </div>
  );
};

export default GrayDividerWithText;
