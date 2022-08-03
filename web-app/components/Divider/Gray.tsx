import React from 'react';
import BaseDivider, { Props as BaseDividerProps } from './Base';

export type Props = Omit<BaseDividerProps, 'color' | 'borderColor'>;

const GrayDivider: React.FunctionComponent<Props> = (props) => (
  <BaseDivider color="bg-gray-80" borderColor="border-gray-80" width="w-full" borderThickness="border-1" {...props} />
);

export default GrayDivider;
