import React from 'react';
import config from '../../config';

type Props = {
  direction: 'down' | 'right';
};

const MobileSearchFilterArrow: React.FunctionComponent<Props> = ({ direction }) => {
  const gray902 = config.colors['gray-902'];

  const Icon = (): JSX.Element => {
    if (direction === 'down') {
      return (
        <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8.5L15.5 1.36957L14.5854 0.5L8 6.76087L1.41463 0.499999L0.500001 1.36956L8 8.5Z" fill={gray902} />
        </svg>
      );
    }
    return (
      <svg width="8" height="15" viewBox="0 0 8 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 7.5L0.869566 8.50296e-08L4.87744e-07 0.914634L6.26087 7.5L6.44803e-07 14.0854L0.869566 15L8 7.5Z"
          fill={gray902}
        />
      </svg>
    );
  };

  return (
    <div className="cursor-pointer">
      <Icon />
    </div>
  );
};

export default MobileSearchFilterArrow;
