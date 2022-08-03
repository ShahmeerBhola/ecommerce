import React, { FC } from 'react';
import SlickSlider, { Settings as Props } from 'react-slick';

import './index.scss';

const Slider: FC<Props> = ({ children, slidesToShow = 5, infinite = true, className = 'mt-10', ...rest }) => {
    return (
        <SlickSlider
            className={className}
            dots={false}
            arrows={false}
            slidesToShow={slidesToShow}
            infinite={infinite}
            {...rest}
        >
            {children}
        </SlickSlider>
    );
};

export default Slider;
