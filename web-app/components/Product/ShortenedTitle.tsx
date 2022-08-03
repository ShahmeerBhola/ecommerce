import React from 'react';
import Text from '../Text';

type Props = {
    title: string;
    fontWeight?: Styles.FontWeights;
    uppercase?: boolean;
    className?: string;
};

const ShortenedProductTitle: React.FunctionComponent<Props> = ({
    title,
    fontWeight = 'font-bold',
    uppercase = true,
    className,
}) => {
    return (
        <Text
            color="text-black"
            weight={fontWeight}
            className={`break-words ${className} ${uppercase ? 'uppercase' : ''}`}
        >
            {title}
        </Text>
    );
};

export default ShortenedProductTitle;
