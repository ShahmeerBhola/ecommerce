import React, { FC } from 'react';
import Button, { Props as ButtonProps } from '../Button';

const AddToCartButton: FC<ButtonProps> = ({ className, onClick, inverted = true, children, ...rest }) => {
    return (
        <div className={`w-full ${className}`}>
            <Button onClick={onClick} inverted={inverted} className="w-full" {...rest}>
                {children || 'Add to Cart'}
            </Button>
        </div>
    );
};

export default AddToCartButton;
