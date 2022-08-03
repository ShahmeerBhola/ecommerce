import React from 'react';
import Container from './Container';
import PhotoBackground from '../PhotoBackground';

type Props = {
    image?: string;
    className?: string;
    backgroundCover?: boolean;
    backgroundClassName?: string;
    backgroundStyles?: React.CSSProperties;
    containerPaddingY?: string;
};

const PhotoContainer: React.FunctionComponent<Props> = ({
    children,
    image,
    className = '',
    backgroundCover,
    backgroundClassName,
    backgroundStyles,
    containerPaddingY,
}) => {
    return (
        <PhotoBackground
            image={image ? `/images/${image}` : undefined}
            cover={backgroundCover}
            className={backgroundClassName}
            styles={backgroundStyles}
        >
            <Container className={className} paddingY={containerPaddingY}>
                {children}
            </Container>
        </PhotoBackground>
    );
};

export default PhotoContainer;
