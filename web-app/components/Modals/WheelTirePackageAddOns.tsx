import React from 'react';
import Router from 'next/router';
import findIndex from 'lodash/findIndex';
import BaseModal, { Props as BaseProps } from './Base';
import { CartContext } from '../Cart';
import Button from '../Button';
import { CloseIcon } from '../Icons';
import Text from '../Text';
import WheelTirePackageAddOn from '../WheelTirePackageAddOn';
import { constructUrl, formatPrice, calculateWheelTirePackagePrice, constructTruckTitle } from '../../utils';

type HeaderSectionProps = {
  title: string;
  closeIconClass: string;
  onClose: () => void;
};

const HeaderSection: React.FunctionComponent<HeaderSectionProps> = ({ title, closeIconClass, onClose }) => (
  <div className="flex justify-between">
    <Text color="text-black" size="text-lg" weight="font-bold">
      {title}
    </Text>
    <CloseIcon onClick={onClose} className={closeIconClass} />
  </div>
);

const SummaryWheelTirePackageAddOn: React.FunctionComponent<{ product: WordPress.Product }> = ({ product }) => (
  <WheelTirePackageAddOn product={product} editMode={false} />
);

interface Props extends BaseProps {
  wheel: WordPress.Product | null;
  tire: WordPress.Product;
  truck: Truck.LocalOrNull;
  addOns: WordPress.Product[];
}

type State = {
  addedAddOns: WordPress.Product[];
  proceedingToCheckout: boolean;
};

export default class WheelTirePackageAddOnsModal extends React.Component<Props> {
  static contextType = CartContext;
  context!: React.ContextType<typeof CartContext>;

  state: State = {
    addedAddOns: [],
    proceedingToCheckout: false,
  };

  addItemToAddOns = (product: WordPress.ProductBase): void => {
    const { state } = this;
    this.setState({ ...state, addedAddOns: [...state.addedAddOns, product] });
  };

  removeItemFromAddOns = (productId: string): void => {
    const { state } = this;
    const { addedAddOns } = state;

    const idx = findIndex(addedAddOns, (product: WordPress.Product) => productId === product.id.toString());
    if (idx !== -1) {
      this.setState({ ...state, addedAddOns: [...addedAddOns.slice(0, idx), ...addedAddOns.slice(idx + 1)] });
    }
  };

  proceedToCheckout = (): void => {
    const {
      state: { addedAddOns },
      props: { wheel, tire, truck },
    } = this;

    this.setState({ proceedingToCheckout: true }, async () => {
      await this.context.addWheelTirePackage({
        wheel: wheel as WordPress.Product,
        tire,
        addOns: addedAddOns,
        truck: truck as Truck.Local,
      });

      Router.push({ pathname: constructUrl({ page: 'cart' }) });
    });
  };

  render(): React.ReactNode {
    const {
      props,
      state: { addedAddOns, proceedingToCheckout },
      proceedToCheckout,
      addItemToAddOns,
      removeItemFromAddOns,
    } = this;
    const { onClose, wheel, tire, truck, addOns } = props;

    if (wheel === null) {
      // wheel is possibly null because it is fetched on the client
      return null;
    }

    const baseClasses = 'flex flex-col overflow-y-auto md:overflow-y-scroll h-auto md:h-full w-full p-5';

    return (
      <BaseModal {...props}>
        <div className="flex flex-wrap h-full">
          <div className={`${baseClasses} md:w-3/5`}>
            <HeaderSection title="Accessories" closeIconClass="inline-block md:hidden" onClose={onClose} />
            <div className="flex flex-wrap my-3">
              {addOns.map((accessory, idx) => (
                <WheelTirePackageAddOn
                  key={idx}
                  product={accessory}
                  onAddItem={addItemToAddOns}
                  onRemoveItem={removeItemFromAddOns}
                />
              ))}
            </div>
          </div>
          <div className={`${baseClasses} md:w-2/5 bg-gray-50`}>
            <HeaderSection title="Summary" closeIconClass="hidden md:inline-block" onClose={onClose} />
            {truck !== null && (
              <>
                <Text className="my-2">{constructTruckTitle(truck)}</Text>
                <Text className="mb-2">Spare Added? {truck.addSpare ? 'Yes' : 'No'}</Text>
              </>
            )}
            <SummaryWheelTirePackageAddOn product={wheel} />
            <SummaryWheelTirePackageAddOn product={tire} />
            {addedAddOns.map((product) => (
              <SummaryWheelTirePackageAddOn key={product.sku} product={product} />
            ))}
            <div className="flex justify-between">
              <Text className="mb-2">Subtotal</Text>
              <Text color="text-red-100">
                {formatPrice(calculateWheelTirePackagePrice({ wheel, tire, addOns: addedAddOns }))}
              </Text>
            </div>

            <Button onClick={proceedToCheckout} disabled={proceedingToCheckout}>
              {proceedingToCheckout ? 'Loading' : 'Proceed to Cart'}
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }
}
