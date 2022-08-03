import React, { FC } from 'react';

type Props = {
    error: Forms.FormikError;
};

const ErrorMessage: FC<Props> = ({ error }) => {
    return (
        <div className="absolute text-red-100 text-xs">
            <span>{error}</span>
        </div>
    );
};

export default ErrorMessage;
