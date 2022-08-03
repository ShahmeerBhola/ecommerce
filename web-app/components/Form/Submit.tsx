import React, { FC } from 'react';
import Button from '../Button';

type OwnProps = {
    isSubmitting: boolean;
    loadingMessage?: string;
};

type AllProps = OwnProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Submit: FC<AllProps> = ({ disabled, loadingMessage = 'Loading', isSubmitting, children }) => {
    return (
        <Button
            type="submit"
            textSize="text-sm"
            disabled={disabled}
            className="w-full h-full"
            onMouseDown={(event): void => {
                // Fixes https://github.com/standout-specialties/ecommerce/issues/59
                // https://github.com/formium/formik/issues/1796
                event.preventDefault();
            }}
        >
            {isSubmitting ? loadingMessage : children}
        </Button>
    );
};

export default Submit;
