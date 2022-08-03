import React from 'react';
import renderer from 'react-test-renderer';
import ProductPage from '../../pages/product/[slug]';
import { ToastProvider, generateMockProduct } from '../utils';
import * as nextRouter from 'next/router';

describe('ProductPage component', () => {
    test('it renders properly when router.isFallback is true', () => {
        nextRouter.useRouter = jest.fn();
        nextRouter.useRouter.mockImplementation(() => ({ isFallback: true }));

        const tree = renderer
            .create(
                <ToastProvider>
                    <ProductPage product={generateMockProduct()} />
                </ToastProvider>,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    test('it renders properly when product is empty', () => {
        nextRouter.useRouter = jest.fn();
        nextRouter.useRouter.mockImplementation(() => ({ isFallback: false }));

        const tree = renderer
            .create(
                <ToastProvider>
                    <ProductPage product={{}} />
                </ToastProvider>,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    test('it renders properly when product is non-empty', () => {
        nextRouter.useRouter = jest.fn();
        nextRouter.useRouter.mockImplementation(() => ({ isFallback: false }));

        const tree = renderer
            .create(
                <ToastProvider>
                    <ProductPage product={generateMockProduct()} />
                </ToastProvider>,
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
