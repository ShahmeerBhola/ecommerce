import { checkAttributes } from './utils';

import type { TProductContext } from './types';

export const reducer = (state: TProductContext.State, action: TProductContext.ActionType): TProductContext.State => {
    switch (action.type) {
        case 'selectAttribute':
            return {
                ...state,
                ...checkAttributes(state, action.payload),
            };

        case 'resetCurrentAttributes':
            return {
                ...state,
                currentAttributes: {},
            };

        case 'selectVariation':
            return {
                ...state,
                variation: action.payload,
            };

        case 'resetVariation':
            return {
                ...state,
                variation: null,
            };

        case 'setAvailableAttributes':
            return {
                ...state,
                availableAttributes: action.payload,
            };

        default:
            throw new Error();
    }
};
