import React, { useContext } from 'react';
import Text from '../Text';
import { CartContext } from './';
import { PulseLoader } from '../Loading';
import { calculateCartTotalQuantity } from '../../utils';

const ItemsInTheCart: React.FunctionComponent = () => {
  const { lineItems, wheelTirePackages, hydratingLineItems } = useContext<Cart.Context>(CartContext);

  const Quantity = (): JSX.Element => {
    if (hydratingLineItems) {
      return (
        <div className="inline-block">
          <PulseLoader />
        </div>
      );
    }
    return <Text color="text-red-200">{calculateCartTotalQuantity(lineItems, wheelTirePackages)}</Text>;
  };

  return (
    <div className="flex items-center">
      <Text className="mr-2">Items in the cart</Text>
      <Quantity />
    </div>
  );
};

export default ItemsInTheCart;
