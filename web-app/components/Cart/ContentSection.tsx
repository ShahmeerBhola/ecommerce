import React from 'react';
import { Props as CartContentProps } from './Content';
import { GrayDividerWithRedText } from '../Divider';

type OwnProps = {
  text: string;
};

type AllProps = OwnProps & CartContentProps;

const ContentSection: React.FunctionComponent<AllProps> = ({ text, children, compact = false }) => (
  <>
    <GrayDividerWithRedText text={text} options={{ divider: { my: compact ? 'my-6' : 'my-10' } }} />
    {children}
  </>
);

export default ContentSection;
