import React from 'react';
import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { useToasts } from 'react-toast-notifications';

import WordPressClient from '../../utils/clients/wordpress';
import {
    transformProductToHydratedLineItem,
    transformHydratedLineItemsToLocalLineItems,
    transformHydratedWheelTirePackagesToLocalWheelTirePackages,
    transformWheelTirePackageToToHydratedWheelTirePackage,
    withToast,
    cartIsEmpty,
    transformTruckToLocalTruck,
    transformProductsToGoogleAnalyticsProducts,
    transformCartToGoogleAnalyticsProducts,
} from '../../utils';
import {
    addLineItemToCart as captureAddLineItemToCartFBPixelEvent,
    addWheelTirePackageToCart as captureAddWheelTirePackageToCartFBPixelEvent,
} from '../../utils/facebookPixel';
import {
    enhancedEcommerceLineItemListName,
    enhancedEcommerceWheelTirePackageAddOnsListName,
    enhancedEcommerceWheelTirePackageListName,
    sendEnhancedEcommerceEvent,
} from '../../utils/googleAnalytics';

type OwnProps = {};
type AllProps = OwnProps & ReturnType<typeof useToasts>;

type State = {
    lineItems: Cart.HydratedLineItem[];
    wheelTirePackages: Cart.HydratedWheelTirePackage[];
    hydratingLineItems: boolean;
};

export const CartContext = React.createContext<Cart.Context>({
    lineItems: [],
    wheelTirePackages: [],
    hydratingLineItems: true,
    addLineItem: async (_product, _truck): Promise<void> => {
        console.log('addLineItem is not implemented...');
    },
    addWheelTirePackage: async (_pack): Promise<void> => {
        console.log('addWheelTirePackage is not implemented...');
    },
    removeWheelTirePackageAddOn: (_packageIdx, _addOnId): void => {
        console.log('removeWheelTirePackageAddOn is not implemented...');
    },
    emptyCart: (): void => {
        console.log('emptyCart is not implemented...');
    },
    deleteLineItem: (_id, _truck): void => {
        console.log('deleteLineItem is not implemented...');
    },
    deleteWheelTirePackage: (_idx): void => {
        console.log('deleteWheelTirePackage is not implemented...');
    },
    updateLineItemQuantity: (_id, _quantity, _truck): void => {
        console.log('updateLineItemQuantity is not implemented...');
    },
});

class CartProvider extends React.Component<AllProps, State> {
    state: State = {
        lineItems: [],
        wheelTirePackages: [],
        hydratingLineItems: true,
    };
    cartLocalStorageKey = 'cart';

    _getItemIndex = (id: number, truck: Truck.LocalOrNull): number => {
        return findIndex(
            this.state.lineItems,
            (item: Cart.HydratedLineItem) => id === item.id && isEqual(truck, item.truck),
        );
    };

    _hydrateCartFromPersistedState = async (): Promise<void> => {
        let hydratedLineItems: Cart.HydratedLineItem[] = [];
        let hydratedWheelTirePackages: Cart.HydratedWheelTirePackage[] = [];
        let persistedLineItems: Cart.BaseLineItem[] = [];
        let persistedWheelTirePackages: Cart.LocalWheelTirePackage[] = [];

        try {
            const persistedCart = JSON.parse(localStorage.getItem(this.cartLocalStorageKey) || '{}') as Cart.LocalCart;
            persistedLineItems = persistedCart.lineItems || [];
            persistedWheelTirePackages = persistedCart.wheelTirePackages || [];
        } catch (err) {
            // silently ignore if there is a json parsing error...
        }

        if (!isEmpty(persistedLineItems) || !isEmpty(persistedWheelTirePackages)) {
            const { line_items, wheel_tire_packages } = await WordPressClient.hydrateCart(
                persistedLineItems,
                persistedWheelTirePackages,
            );

            hydratedLineItems = line_items.map(({ truck, ...product }) => ({
                ...transformProductToHydratedLineItem(product),
                truck: truck === null ? null : transformTruckToLocalTruck(truck),
            }));
            hydratedLineItems = hydratedLineItems.map(({ id, quantity, ...rest }) => {
                const cartIdx = findIndex(persistedLineItems, ({ id: cartId }) => id === cartId);
                return {
                    id,
                    ...rest,
                    quantity: cartIdx === -1 ? quantity : persistedLineItems[cartIdx].quantity,
                };
            });

            hydratedWheelTirePackages = wheel_tire_packages.map(transformWheelTirePackageToToHydratedWheelTirePackage);
        }

        this.setState({
            hydratingLineItems: false,
            lineItems: hydratedLineItems,
            wheelTirePackages: hydratedWheelTirePackages,
        });
    };

    updateStateAndLocalStorage = (newState: State): void => {
        const { lineItems, wheelTirePackages } = newState;
        if (cartIsEmpty(lineItems, wheelTirePackages)) {
            localStorage.removeItem(this.cartLocalStorageKey);
        } else {
            localStorage.setItem(
                this.cartLocalStorageKey,
                JSON.stringify({
                    lineItems: transformHydratedLineItemsToLocalLineItems(lineItems),
                    wheelTirePackages: transformHydratedWheelTirePackagesToLocalWheelTirePackages(wheelTirePackages),
                }),
            );
        }

        this.setState(newState);
    };

    addLineItem = async (product: WordPress.ProductBase, truck: Truck.LocalOrNull = null): Promise<void> => {
        const {
            state,
            props: { addToast },
            updateStateAndLocalStorage,
            _getItemIndex,
            _hydrateCartFromPersistedState,
        } = this;
        const { lineItems } = state;
        let newLineItems: Cart.HydratedLineItem[];

        sendEnhancedEcommerceEvent(
            'add_to_cart',
            transformProductsToGoogleAnalyticsProducts([
                {
                    ...product,
                    list_name: enhancedEcommerceLineItemListName,
                },
            ]),
        );

        const lineItem = transformProductToHydratedLineItem(product, truck);
        const idx = _getItemIndex(lineItem.id, truck);

        if (idx !== -1) {
            newLineItems = [
                ...lineItems.slice(0, idx),
                {
                    ...lineItems[idx],
                    quantity: lineItems[idx].quantity + 1,
                },
                ...lineItems.slice(idx + 1),
            ];
        } else {
            newLineItems = [...lineItems, lineItem];
        }

        captureAddLineItemToCartFBPixelEvent(product);
        updateStateAndLocalStorage({ ...state, lineItems: newLineItems });

        // This is here because we want to re-fetch prices from our server, they may have changed depending on input (ex. a spare added to a wheel increases the price by 25%)
        await _hydrateCartFromPersistedState();

        addToast('Item added to cart', { appearance: 'success' });
    };

    addWheelTirePackage = async (wheelTirePackage: Cart.WheelTirePackage): Promise<void> => {
        const { wheel, tire, addOns, truck } = wheelTirePackage;
        const {
            state,
            props: { addToast },
            updateStateAndLocalStorage,
            _hydrateCartFromPersistedState,
        } = this;

        captureAddWheelTirePackageToCartFBPixelEvent(wheelTirePackage);
        updateStateAndLocalStorage({
            ...state,
            wheelTirePackages: [
                ...state.wheelTirePackages,
                {
                    wheel: transformProductToHydratedLineItem(wheel),
                    tire: transformProductToHydratedLineItem(tire),
                    addOns: addOns.map((addOn) => transformProductToHydratedLineItem(addOn)),
                    truck,
                },
            ],
        });

        sendEnhancedEcommerceEvent(
            'add_to_cart',
            transformProductsToGoogleAnalyticsProducts([
                {
                    ...wheel,
                    list_name: enhancedEcommerceWheelTirePackageListName,
                },
                {
                    ...tire,
                    list_name: enhancedEcommerceWheelTirePackageListName,
                },
                ...addOns.map((addOn) => ({ ...addOn, list_name: enhancedEcommerceWheelTirePackageAddOnsListName })),
            ]),
        );

        // This is here because we want to re-fetch prices from our server, they may have changed depending on input (ex. a spare added to a wheel increases the price by 25%)
        await _hydrateCartFromPersistedState();

        addToast('Wheel & Tire package added to cart', { appearance: 'success' });
    };

    removeWheelTirePackageAddOn = (packIdx: number, addOnId: number): void => {
        const {
            state: { wheelTirePackages, ...rest },
            props: { addToast },
            updateStateAndLocalStorage,
        } = this;
        const wheelTirePackage = wheelTirePackages[packIdx];
        const { addOns } = wheelTirePackage;
        const addOnIdx = findIndex(addOns, ({ id }) => id === addOnId);

        sendEnhancedEcommerceEvent(
            'remove_from_cart',
            transformProductsToGoogleAnalyticsProducts([
                {
                    ...addOns[addOnIdx],
                    list_name: enhancedEcommerceWheelTirePackageAddOnsListName,
                },
            ]),
        );

        updateStateAndLocalStorage({
            ...rest,
            wheelTirePackages: [
                ...wheelTirePackages.slice(0, packIdx),
                {
                    ...wheelTirePackage,
                    addOns: [...addOns.slice(0, addOnIdx), ...addOns.slice(addOnIdx + 1)],
                },
                ...wheelTirePackages.slice(packIdx + 1),
            ],
        });

        addToast('Wheel & Tire package updated', { appearance: 'info' });
    };

    deleteLineItem = (id: number, truck: Truck.LocalOrNull): void => {
        const {
            state,
            props: { addToast },
            _getItemIndex,
            updateStateAndLocalStorage,
        } = this;
        const { lineItems } = state;
        const idx = _getItemIndex(id, truck);

        if (idx !== -1) {
            sendEnhancedEcommerceEvent(
                'remove_from_cart',
                transformProductsToGoogleAnalyticsProducts([
                    {
                        ...lineItems[idx],
                        list_name: enhancedEcommerceLineItemListName,
                    },
                ]),
            );

            updateStateAndLocalStorage({
                ...state,
                lineItems: [...lineItems.slice(0, idx), ...lineItems.slice(idx + 1)],
            });
            addToast('Item removed from cart', { appearance: 'info' });
        }
    };

    deleteWheelTirePackage = (idx: number): void => {
        const {
            state,
            props: { addToast },
            updateStateAndLocalStorage,
        } = this;
        const { wheelTirePackages } = state;

        if (idx !== -1) {
            sendEnhancedEcommerceEvent(
                'remove_from_cart',
                transformCartToGoogleAnalyticsProducts([], [wheelTirePackages[idx]]),
            );

            updateStateAndLocalStorage({
                ...state,
                wheelTirePackages: [...wheelTirePackages.slice(0, idx), ...wheelTirePackages.slice(idx + 1)],
            });
            addToast('Wheel & Tire package removed from cart', { appearance: 'info' });
        }
    };

    emptyCart = (): void => {
        this.updateStateAndLocalStorage({
            hydratingLineItems: false,
            lineItems: [],
            wheelTirePackages: [],
        });
    };

    updateLineItemQuantity = (id: number, quantity: number, truck: Truck.LocalOrNull): void => {
        const {
            state,
            props: { addToast, removeAllToasts },
            _getItemIndex,
            updateStateAndLocalStorage,
        } = this;
        const { lineItems } = state;
        const idx = _getItemIndex(id, truck);

        sendEnhancedEcommerceEvent(
            'add_to_cart',
            transformProductsToGoogleAnalyticsProducts([
                {
                    ...lineItems[idx],
                    quantity: quantity - lineItems[idx].quantity,
                    list_name: enhancedEcommerceLineItemListName,
                },
            ]),
        );

        updateStateAndLocalStorage({
            ...state,
            lineItems: [
                ...lineItems.slice(0, idx),
                {
                    ...lineItems[idx],
                    quantity,
                },
                ...lineItems.slice(idx + 1),
            ],
        });

        removeAllToasts();
        addToast('Quantity updated', { appearance: 'info' });
    };

    async componentDidMount(): Promise<void> {
        await this._hydrateCartFromPersistedState();
    }

    render(): JSX.Element {
        const {
            state: { lineItems, wheelTirePackages, hydratingLineItems },
            props: { children },
            addLineItem,
            addWheelTirePackage,
            removeWheelTirePackageAddOn,
            emptyCart,
            deleteLineItem,
            deleteWheelTirePackage,
            updateLineItemQuantity,
        } = this;

        return (
            <CartContext.Provider
                value={{
                    lineItems,
                    wheelTirePackages,
                    hydratingLineItems,
                    addLineItem,
                    addWheelTirePackage,
                    removeWheelTirePackageAddOn,
                    emptyCart,
                    deleteLineItem,
                    deleteWheelTirePackage,
                    updateLineItemQuantity,
                }}
            >
                {children}
            </CartContext.Provider>
        );
    }
}

export default withToast<OwnProps, State>(CartProvider);
