import React from 'react';
import TextDefault from '../Text';
import { Props as TextProps } from '../Text';

const Text: React.FunctionComponent<TextProps> = ({ children, size = 'text-sm', ...rest }) => (
  <TextDefault size={size} {...rest}>
    {children}
  </TextDefault>
);

export default Text;
