import React, { FC } from 'react';

import ErrorMessage from './ErrorMessage';

type Props = {
    touched?: boolean;
    className?: string;
    error?: Forms.FormikError;
    noBottomPadding?: boolean;
    noXPadding?: boolean;
};

const InputGroup: FC<Props> = ({
    error,
    touched,
    className,
    noBottomPadding = false,
    noXPadding = false,
    children,
}) => {
    const isError = error && touched;
    const classNames = `pt-2 box-border ${noXPadding ? '' : 'px-2'} ${className}`;

    return (
        <div className={`${classNames} ${noBottomPadding ? '' : 'pb-3'}`}>
            <div className="relative h-full">
                {children}
                {isError && <ErrorMessage error={error} />}
            </div>
        </div>
    );
};

export default InputGroup;
