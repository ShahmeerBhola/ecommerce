import React, { FC, createContext, useReducer, Reducer } from 'react';

import { reducer } from './reducer';
import { useMiddleware } from './middleware';

import type { TProductContext } from './types';

const INIT_STATE = {
    product: null,
    variation: null,
    currentAttributes: {},
    queryParams: {},
    availableAttributes: {},
};

export const ProductContext = createContext<TProductContext.ReduxType>({ state: INIT_STATE, dispatch: () => ({}) });

export const ProductProvider: FC<{ defaultState: TProductContext.State }> = ({ defaultState, children }) => {
    const [state, dispatch] = useReducer<Reducer<TProductContext.State, TProductContext.ActionType>>(
        reducer,
        defaultState,
    );
    useMiddleware(state, dispatch);

    return <ProductContext.Provider value={{ state, dispatch }}>{children}</ProductContext.Provider>;
};
