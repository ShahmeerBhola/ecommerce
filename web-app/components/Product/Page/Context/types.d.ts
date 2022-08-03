declare namespace TProductContext {
    export interface State {
        product: WordPress.Product | WordPress.ProductVariation | null;
        variation: WordPress.ProductVariation | null;
        currentAttributes: StringMap | {};
        queryParams: StringMap;
        availableAttributes?: StringMap | {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type ActionType = { type: string; payload?: any };
    export type ReduxType = { state: ProductContextInterface; dispatch: React.Dispatch<ActionType> };

    export type CheckAttributesType = {
        currentAttributes: StringMap | {};
        availableAttributes?: StringMap | {};
    };
}

export { TProductContext };
