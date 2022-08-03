import React from 'react';
import DividerWithText, { Props } from './GrayDividerWithText';

const GrayDividerWithBlackText: React.FunctionComponent<Props> = ({ text, options, children }) => (
  <DividerWithText
    text={text}
    options={{
      text: {
        color: 'text-black',
        weight: 'font-bold',
        size: 'text-lg',
        className: 'uppercase whitespace-no-wrap mr-10',
      },
      divider: options?.divider || {},
    }}
  >
    {children}
  </DividerWithText>
);

export default GrayDividerWithBlackText;
