import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../Button';
import WhiteBox from '../WhiteBox';
import Text from '../Text';
import { ProductImage, ProductVariations, ShortenedProductTitle } from '../Product';
import Price from '../Price';
import {
  calculateSoldAsQuantityTextFromParams,
  productHasVariations,
  calculateProductVariationPrice,
  determineProductVariationFeaturedImage,
} from '../../utils';

type Props = {
  product: WordPress.Product;
  editMode?: boolean;
  addedByDefault?: boolean;
  onAddItem?: (product: WordPress.ProductBase) => void;
  onRemoveItem?: (productId: string) => void;
};

const WheelAccessoryAddOn: React.FunctionComponent<Props> = ({
  product,
  editMode = true,
  addedByDefault = false,
  onAddItem,
  onRemoveItem,
}) => {
  const { query } = useRouter();
  const [added, updateAddedState] = useState<boolean>(false);
  const [selectedVariant, updateSelectedVariant] = useState<WordPress.ProductVariation | null>(null);

  const { quantity_sold_in, sold_as_truck_set, name } = product;
  const hasVariations = productHasVariations(product);

  const featuredImage = determineProductVariationFeaturedImage(product, selectedVariant);
  const { price, sale_price } = calculateProductVariationPrice(product, selectedVariant);

  useEffect(() => {
    if (!added && addedByDefault) {
      onAddItem && onAddItem(product);
      updateAddedState(true);
    }
  }, [added, addedByDefault, onAddItem, updateAddedState, product]);

  const ActionButton = (): JSX.Element => (
    <Button
      onClick={(): void => {
        const productToAdd: WordPress.ProductBase = selectedVariant ? selectedVariant : product;
        if (added) {
          onRemoveItem && onRemoveItem(productToAdd.id.toString());
          updateAddedState(false);
        } else {
          onAddItem && onAddItem(productToAdd);
          updateAddedState(true);
        }
      }}
      disabled={hasVariations && selectedVariant === null}
    >
      {added ? 'Remove' : 'Add'}
    </Button>
  );

  const HasVariationsSection = (): JSX.Element => (
    <div className="flex w-full md:w-auto mt-3 md:mt-0 items-center justify-between">
      <ProductVariations
        product={product}
        selectedVariant={selectedVariant}
        onVariantSelect={updateSelectedVariant}
        className="mr-2 flex-grow"
      />
      <ActionButton />
    </div>
  );

  const NoVariationsSection = (): JSX.Element => <ActionButton />;

  return (
    <WhiteBox className="w-full p-5 my-2">
      <div className="flex items-center">
        <div className="mr-3">
          <ProductImage image={featuredImage} wrapperClassName="w-20 h-20" />
        </div>
        <div className="flex-grow">
          <ShortenedProductTitle title={name} />
          <Text>{calculateSoldAsQuantityTextFromParams(quantity_sold_in, sold_as_truck_set, query)}</Text>
          <div className="flex flex-wrap md:flex-no-wrap justify-between items-center">
            <div className="mr-2">
              <Price price={price} salePrice={sale_price} />
            </div>
            {editMode && (hasVariations ? <HasVariationsSection /> : <NoVariationsSection />)}
          </div>
        </div>
      </div>
    </WhiteBox>
  );
};

export default WheelAccessoryAddOn;
