import React, { FC } from 'react';
import Link from 'next/link';

type OwnProps = {
    inverted?: boolean;
    textSize?: Styles.FontSizes;
    paddingX?: string;
    link?: string;
};

export type Props = OwnProps &
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Button: FC<Props> = ({
    children,
    link,
    className,
    inverted = false,
    textSize = 'text-sm',
    paddingX = 'px-5',
    type = 'button',
    ...rest
}) => {
    let extraClassNames: string;
    if (inverted) {
        extraClassNames =
            'text-red-100 hover:text-red-200 bg-transparent border-solid border-2 border-red-100 hover:border-red-200';
    } else {
        extraClassNames = 'text-white bg-red-100 hover:bg-red-200';
    }

    let classes = `${textSize} font-primary font-bold py-2 ${paddingX} uppercase disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none`;
    classes += ` ${className}`;
    classes += ` ${extraClassNames}`;

    const Butt = (): JSX.Element => (
        <button className={classes} type={type} {...rest}>
            {children}
        </button>
    );

    if (link) {
        return (
            <Link href={link}>
                <a>
                    <Butt />
                </a>
            </Link>
        );
    }

    return <Butt />;
};

export default Button;
