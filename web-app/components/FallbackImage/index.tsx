import React, { FC, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import LazyLoad, { LazyLoadProps } from 'react-lazyload';

import { ImageLoader } from '../Loading';

import './fallback_image.scss';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackSrc: string;
    lazyLoadProps?: LazyLoadProps;
}

const Wrapper: FC = ({ children }): JSX.Element => <div className="h-full w-full">{children}</div>;

// https://stackoverflow.com/a/52749807/3902555
const FallbackImage: FC<Props> = ({ src: defaultSrc, fallbackSrc, lazyLoadProps, ...rest }) => {
    const [src, updateSrc] = useState<string>(defaultSrc);
    const [errored, updatedErrorState] = useState<boolean>(false);

    const onError = (): void => {
        if (!errored) {
            updatedErrorState(true);
            updateSrc(fallbackSrc);
        }
    };

    const Image = (): JSX.Element => (
        <img src={src} onError={onError} {...rest} className="m-auto w-full h-full object-contain" />
    );

    if (!isEmpty(lazyLoadProps)) {
        return (
            <Wrapper>
                <LazyLoad placeholder={<ImageLoader />} {...lazyLoadProps}>
                    <Image />
                </LazyLoad>
            </Wrapper>
        );
    }
    return (
        <Wrapper>
            <Image />
        </Wrapper>
    );
};

export default FallbackImage;
