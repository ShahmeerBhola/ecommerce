import React from 'react';
import InputNumber from 'rc-input-number';
import { InputNumberProps } from 'rc-input-number/lib/interface';

import './number_input.scss';

type Props = Omit<InputNumberProps, 'style'>;

const NumberInput: React.FunctionComponent<Props> = ({ min = 0, ...props }) => (
  <InputNumber
    min={min}
    style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}
    focusOnUpDown
    {...props}
  />
);

export default NumberInput;
