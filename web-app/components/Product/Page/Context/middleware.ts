import { useEffect, Dispatch } from 'react';
import isEmpty from 'lodash/isEmpty';

import { isActiveAttribute } from './utils';

import type { TProductContext } from './types';

export const useMiddleware = (state: TProductContext.State, dispatch: Dispatch<TProductContext.ActionType>): void => {
    const { currentAttributes, product, variation, queryParams } = state;
    const { default_attributes, variations } = product as WordPress.Product;

    // Check default selected attributes
    useEffect(() => {
        const { variant } = queryParams;

        if (!isEmpty(variant)) {
            for (const _variation of variations) {
                if (+_variation.id === +variant) {
                    dispatch({
                        type: 'selectAttribute',
                        payload: _variation.attributes,
                    });

                    break;
                }
            }
        } else {
            dispatch({
                type: 'selectAttribute',
                payload: default_attributes,
            });
        }
    }, []); // eslint-disable-line

    // Select variation if exists
    useEffect(() => {
        if (!isEmpty(currentAttributes)) {
            let hasVariation = false;

            for (const _variation of variations) {
                const { attributes } = _variation;
                const isActive = isActiveAttribute(attributes, currentAttributes);

                if (isActive) {
                    hasVariation = true;

                    dispatch({
                        type: 'selectVariation',
                        payload: _variation,
                    });
                    break;
                }
            }

            if (!hasVariation) {
                dispatch({ type: 'resetVariation' });
            }
        }
    }, [variations, currentAttributes]); // eslint-disable-line

    // Update variation url parameter
    useEffect(() => {
        const url = new URL(window.location.href);

        if (!isEmpty(variation)) {
            const { id } = variation || {};
            url.searchParams.delete('variant');
            url.searchParams.set('variant', `${id}`);

            window.history.replaceState(null, '', url);
        } else {
            const variantValue = url.searchParams.get('variant');

            if (variantValue) {
                url.searchParams.delete('variant');
                window.history.replaceState(null, '', url);
            }
        }
    }, [variation]); // eslint-disable-line
};
