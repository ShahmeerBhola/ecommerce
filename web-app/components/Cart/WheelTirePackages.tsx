import React, { useContext } from 'react';
import { CartContext, CartItem as CItem } from './';
import { Props as CartContentProps } from './Content';
import ContentSection from './ContentSection';
import { Props as CartItemProps } from './Item';
import WhiteBox from '../WhiteBox';
import Text from '../Text';
import { GrayDivider } from '../Divider';
import { ThinCloseIcon } from '../Icons';
import {
  constructTruckTitle,
  formatPrice,
  calculateWheelTirePackagePrice,
  calculateWheelTirePackageAddOnsPrice,
} from '../../utils';

type PackageMetaDataProps = {
  header: string;
  value: string;
  uppercase?: boolean;
};

interface AddOnItemProps extends CartItemProps {
  packageIdx: number;
  addOnId: number;
}

const PackageMetadata: React.FunctionComponent<PackageMetaDataProps> = ({ header, value, uppercase = false }) => (
  <div className="mb-3">
    <Text>{header}</Text>
    <Text className={uppercase ? 'uppercase' : ''} color="text-black" weight="font-medium" size="text-sm">
      {value}
    </Text>
  </div>
);

const WheelTirePackages: React.FunctionComponent<Pick<CartContentProps, 'hideDelete' | 'compact'>> = ({
  hideDelete = false,
  compact = false,
}) => {
  const { wheelTirePackages, deleteWheelTirePackage, removeWheelTirePackageAddOn } = useContext(CartContext);

  const AddOnItem: React.FunctionComponent<AddOnItemProps> = ({ item, addOnId, packageIdx, className }) => (
    <CItem
      item={item}
      hideDelete={hideDelete}
      onDeleteClick={(): void => removeWheelTirePackageAddOn(packageIdx, addOnId)}
      hideQuantity
      includeWhiteBox={false}
      className={className}
      compact={compact}
    />
  );

  const WheelTireCartItem: React.FunctionComponent<CartItemProps> = ({ item }) => (
    <CItem item={item} hideDelete hideQuantity includeWhiteBox={false} className="px-4" compact={compact} />
  );

  return wheelTirePackages.length > 0 ? (
    <ContentSection text="Wheel & Tire Packages" compact={compact}>
      {wheelTirePackages.map((pack, idx) => {
        const { wheel, tire, addOns, truck } = pack;
        return (
          <WhiteBox key={idx} className="my-2">
            <div className="py-8 relative">
              {!hideDelete && (
                <ThinCloseIcon
                  className="absolute right-15px top-15px"
                  onClick={(): void => {
                    if (confirm('Are you sure you want to remove this wheel and tire package?')) {
                      deleteWheelTirePackage(idx);
                    }
                  }}
                />
              )}
              <WheelTireCartItem item={wheel} />
              <div className="px-4">
                <GrayDivider my={compact ? 'my-4' : 'my-6'} />
              </div>
              <WheelTireCartItem item={tire} />
            </div>

            <div className="bg-gray-50 py-5">
              <div className="flex flex-wrap justify-between items-top px-4">
                <div className={`w-full${compact ? '' : ' lg:w-1/3 lg:mb-0'} mb-4`}>
                  <PackageMetadata header="Truck" value={constructTruckTitle(truck)} uppercase />
                  <PackageMetadata header="Spare Added" value={truck.addSpare ? 'Yes' : 'No'} />
                </div>
                {addOns.length > 0 && (
                  <WhiteBox className={`w-full${compact ? '' : ' lg:w-7/12'} p-4`}>
                    <div className="flex justify-between items-center">
                      <Text weight="font-medium" color="text-black">
                        Additional Options
                      </Text>
                      <div className="flex items-center">
                        <Text className="mr-5" size="text-sm">
                          Price
                        </Text>
                        <Text color="text-red-100" weight="font-medium">
                          {formatPrice(calculateWheelTirePackageAddOnsPrice(addOns), true)}
                        </Text>
                      </div>
                    </div>
                    <GrayDivider my="my-4" />
                    <div>
                      {addOns.map((addOn, addOnIdx) => (
                        <AddOnItem
                          key={`${idx}_${addOnIdx}`}
                          item={addOn}
                          addOnId={addOn.id}
                          packageIdx={idx}
                          className="my-2"
                        />
                      ))}
                    </div>
                  </WhiteBox>
                )}
              </div>
              <div className="flex px-4">
                <div className="flex items-center ml-auto mt-5">
                  <Text weight="font-semibold" color="text-black" className="mr-10">
                    Package subtotal
                  </Text>
                  <Text weight="font-medium" color="text-red-100">
                    {formatPrice(calculateWheelTirePackagePrice(pack), true)}
                  </Text>
                </div>
              </div>
            </div>
          </WhiteBox>
        );
      })}
    </ContentSection>
  ) : null;
};

export default WheelTirePackages;
