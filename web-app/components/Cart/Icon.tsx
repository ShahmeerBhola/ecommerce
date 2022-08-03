import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Circle from '../Circle';
import { CircleLoader } from '../Loading';
import { CartContext } from './Context';
import { calculateCartTotalQuantity, constructUrl } from '../../utils';

const CartIconSvg: React.FunctionComponent = () => (
  <svg width="30" height="30" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.01167 26.2134H23.2637L24.2063 22.5357H4.2741L0 5.86091H28.4804L29.9827 0H38V2.18315H31.7304L25.5486 26.3006C27.3481 26.6775 28.7015 28.2406 28.7015 30.1067C28.7015 32.2535 26.9108 34 24.7097 34C22.5086 34 20.718 32.2534 20.718 30.1067C20.718 29.4935 20.8646 28.9131 21.1247 28.3966H11.5967C11.8569 28.9131 12.0034 29.4935 12.0034 30.1067C12.0034 32.2535 10.2127 34 8.01167 34C5.81065 34 4.0199 32.2534 4.0199 30.1067C4.01997 27.96 5.81072 26.2134 8.01167 26.2134Z"
      fill="white"
    />
  </svg>
);

const CartIcon: React.FunctionComponent = () => {
  const { lineItems, wheelTirePackages, hydratingLineItems } = useContext<Cart.Context>(CartContext);
  const cartQuantity = calculateCartTotalQuantity(lineItems, wheelTirePackages);
  const router = useRouter();

  const CartQuantity = (): JSX.Element | null => {
    const hasItems = cartQuantity > 0;
    if (hydratingLineItems) {
      return (
        <div className="absolute bottom-0 right-0">
          <CircleLoader width="16px" />
        </div>
      );
    } else if (hasItems) {
      return <Circle className="absolute bottom-0 right-0">{cartQuantity}</Circle>;
    }
    return null;
  };

  const goToCart = (): Promise<boolean> => router.push(constructUrl({ page: 'cart' }));

  return (
    <div className="relative cursor-pointer" onClick={goToCart}>
      <CartIconSvg />
      <CartQuantity />
    </div>
  );
};

export default CartIcon;
