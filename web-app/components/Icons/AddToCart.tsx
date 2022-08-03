import React, { useContext } from 'react';
import { CartContext } from '../Cart';
import config from '../../config';

type Props = {
    product: WordPress.Product;
};

const AddToCart: React.FunctionComponent<Props> = ({ product }) => {
    const { addLineItem } = useContext(CartContext);
    const red100 = config.colors['red-100'];

    return (
        <div
            className="cursor-pointer inline-block"
            onClick={(): void => {
                addLineItem(product);
            }}
        >
            <svg width="30" height="30" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="50" fill={red100} />
                <path
                    d="M18.325 32.5875H30.3661L31.1103 29.5588H15.3743L12 15.8266H34.4845L35.6705 11H42V12.7979H37.0503L32.1699 32.6593C33.5906 32.9697 34.6591 34.2569 34.6591 35.7938C34.6591 37.5617 33.2454 39 31.5077 39C29.77 39 28.3563 37.5616 28.3563 35.7938C28.3563 35.2887 28.472 34.8108 28.6774 34.3854H21.1553C21.3607 34.8108 21.4764 35.2887 21.4764 35.7938C21.4764 37.5617 20.0627 39 18.325 39C16.5874 39 15.1736 37.5616 15.1736 35.7938C15.1737 34.0259 16.5874 32.5875 18.325 32.5875Z"
                    fill="white"
                />
                <path d="M23.7656 19H26.2656V27H23.7656V19Z" fill={red100} />
                <path d="M29 21.7383L29 24.2383L21 24.2383L21 21.7383L29 21.7383Z" fill={red100} />
            </svg>
        </div>
    );
};

export default AddToCart;
