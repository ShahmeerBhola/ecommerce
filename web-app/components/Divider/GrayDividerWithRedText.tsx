import React from 'react';
import DividerWithText, { Props } from './GrayDividerWithText';

const GrayDividerWithRedText: React.FunctionComponent<Props> = ({ text, options, children }) => (
  <DividerWithText
    text={text}
    options={{
      text: {
        color: 'text-red-100',
        weight: 'font-medium',
        className: 'whitespace-no-wrap mr-10',
      },
      divider: options?.divider || {},
    }}
  >
    {children}
  </DividerWithText>
);

export default GrayDividerWithRedText;
