import React from 'react';

type Props = {
  image?: string;
  className?: string;
  cover?: boolean;
  styles?: React.CSSProperties;
};

const PhotoBackground: React.FunctionComponent<Props> = ({ children, image, cover = true, className = '', styles }) => {
  let backgroundStyles: React.CSSProperties = {};

  if (image) {
    backgroundStyles.backgroundImage = `url(${image})`;
  }
  if (styles !== undefined) {
    backgroundStyles = { ...backgroundStyles, ...styles };
  }

  return (
    <div className={`bg-no-repeat ${className} ${cover ? 'bg-cover' : ''}`} style={backgroundStyles}>
      {children}
    </div>
  );
};

export default PhotoBackground;
