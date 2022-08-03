import React from 'react';
import BaseDivider, { Props } from './Base';

const RedDivider: React.FunctionComponent<Omit<Props, 'color' | 'borderColor'>> = (props) => (
  <BaseDivider color="bg-red-100" borderColor="border-red-100" {...props} />
);

export default RedDivider;
