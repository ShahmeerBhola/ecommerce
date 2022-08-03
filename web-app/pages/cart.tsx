import React, { FC, useContext } from 'react';

import { constructUrl, calculateCartTotalPrice, cartIsEmpty } from '../utils';

import Text from '../components/Text';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Price from '../components/Price';
import { CartContext, CartContent, EmptyCartMessage } from '../components/Cart';

const CartPage: FC = () => {
    const { lineItems, wheelTirePackages, hydratingLineItems } = useContext(CartContext);

    const NonEmptyCart = (): JSX.Element => (
        <>
            <CartContent />
            <div className="flex flex-wrap items-center justify-between mt-5">
                <Text color="text-black" className="w-full md:w-auto">
                    Discounts, taxes, and shipping will be calculated in the next step
                </Text>
                <div className="w-full md:w-auto mt-5 md:mt-0">
                    <Text>Subtotal</Text>
                    <Price price={calculateCartTotalPrice(lineItems, wheelTirePackages)} size="text-lg" showDecimal />
                </div>
            </div>
            <div className="flex">
                <div className="ml-0 md:ml-auto">
                    <Button className="mt-5" link={constructUrl({ page: 'checkout' })}>
                        Checkout
                    </Button>
                </div>
            </div>
        </>
    );

    const isEmpty = cartIsEmpty(lineItems, wheelTirePackages);

    return (
        <Layout
            seoProps={{
                title: 'Cart',
                noindex: true,
                nofollow: true,
            }}
            bgColor="bg-gray-50"
            headerTitle="My Cart"
            pageLoading={hydratingLineItems}
            containerItemsPosition={isEmpty ? 'items-center' : 'items-top'}
            containerPadding="py-5"
        >
            {isEmpty ? <EmptyCartMessage /> : <NonEmptyCart />}
        </Layout>
    );
};

export default CartPage;
