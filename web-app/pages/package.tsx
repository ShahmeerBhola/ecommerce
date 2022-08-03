import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import isEmpty from 'lodash/isEmpty';

import WordPressClient from '../utils/clients/wordpress';

import { WheelTirePackageForm } from '../components/Forms';
import Layout from '../components/Layout';
import { CarouselSection, PackagePrice, PreviewProduct } from '../components/NewCheckout';

const PAGE_SEO = { title: 'Group product' };

type Product = WordPress.Product | {};

type RelatedProducts = {
    wheels: Product[] | [];
    tires: Product[] | [];
};

type Props = {
    wheelProduct: Product;
    tireProduct: Product;
    relatedProducts: RelatedProducts;
};

type QueryProps = {
    wheel: string;
    tire: string;
};

const fetchPackageProducts = async (wheelID: string, tireID: string, addSpare = '0'): Promise<Product[]> => {
    const [wheelProduct, tireProduct] = await Promise.all([
        WordPressClient.getProduct(wheelID, addSpare, tireID),
        WordPressClient.getProduct(tireID, addSpare, wheelID),
    ]);

    return [wheelProduct, tireProduct];
};

const filterProducts = (products: WordPress.Product[], currentProduct: Product): (WordPress.Product | [])[] | [] => {
    if (!('id' in currentProduct)) return [];

    const productFilter = products.filter(({ id }) => id !== currentProduct.id);

    return productFilter.length ? [currentProduct, ...productFilter] : [];
};

const fetchProducts = async (wheelID: string, tireID: string): Promise<[Product, Product, RelatedProducts]> => {
    const [wheelProduct, tireProduct] = await fetchPackageProducts(wheelID, tireID);

    const relatedProducts: RelatedProducts = {
        wheels: [],
        tires: [],
    };

    const wheelMeta = 'metadata' in wheelProduct ? wheelProduct.metadata : {};
    const tireMeta = 'metadata' in tireProduct ? tireProduct.metadata : {};
    const { Diameter, /* Offset, */ ['Bolt Pattern']: BoltPattern } = wheelMeta as WordPress.WheelMetadata;
    const {
        ['Wheel Size']: WheelSize,
        Height,
        Width /*['Load Range']: LoadRange */,
    } = tireMeta as WordPress.TireMetadata;

    const [wheelsProducts, tiresProducts] = await Promise.all([
        WordPressClient.getProducts<API.ProductsResponse>(
            {
                per_page: '20',
                category: 'wheels',
                diameter: Diameter || '',
                // offset: Offset || '',
                bolt_pattern: BoltPattern || '',
            },
            { products: [] },
        ),
        WordPressClient.getProducts<API.ProductsResponse>(
            {
                per_page: '20',
                category: 'tires',
                wheel_size: WheelSize || '',
                height: Height || '',
                width: Width || '',
                // load_range: LoadRange || '',
            },
            { products: [] },
        ),
    ]);

    if (!isEmpty(wheelsProducts)) {
        const {
            data: { products },
        } = wheelsProducts;

        relatedProducts.wheels = filterProducts(products, wheelProduct);
    }

    if (!isEmpty(tiresProducts)) {
        const {
            data: { products },
        } = tiresProducts;

        relatedProducts.tires = filterProducts(products, tireProduct);
    }

    return [wheelProduct, tireProduct, relatedProducts];
};

const PackagePage: NextPage<Props> = ({ wheelProduct, tireProduct, relatedProducts }) => {
    const [selectedWheel, setSelectedWheel] = useState<WordPress.Product>(wheelProduct as WordPress.Product);
    const [selectedTire, setSelectedTire] = useState<WordPress.Product>(tireProduct as WordPress.Product);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeCarouselKey, setActiveCarouselKey] = useState<string>('');
    const [addSpare, setAddSpare] = useState<boolean>(false);

    const { sale_price: wheelSalePrice, id: wheelID } = selectedWheel;
    const { sale_price: tireSalePrice, id: tireID } = selectedTire;

    const totalPrice = wheelSalePrice + tireSalePrice;

    const onSelectHandler = async (id: string, type: string): Promise<void> => {
        setIsLoading(true);

        setActiveCarouselKey(type);
        const packageProductID = type === 'wheel' ? tireID : wheelID;
        const newProduct = await WordPressClient.getProduct(id, '0', '' + packageProductID);

        type === 'wheel'
            ? setSelectedWheel(newProduct as WordPress.Product)
            : setSelectedTire(newProduct as WordPress.Product);

        setIsLoading(false);
    };

    const loadingClass = isLoading ? 'opacity-50' : '';

    useEffect(() => {
        const fetchSpareProducts = async (): Promise<void> => {
            const hasSpare = addSpare ? '1' : '0';
            const [wProduct, tProduct] = await fetchPackageProducts('' + wheelID, '' + tireID, hasSpare);

            setSelectedWheel(wProduct as WordPress.Product);
            setSelectedTire(tProduct as WordPress.Product);

            setIsLoading(false);
        };

        setIsLoading(true);
        fetchSpareProducts();
    }, [addSpare]);

    const onSpareChange = (value: boolean): void => {
        setAddSpare(value);
    };

    return (
        <Layout seoProps={PAGE_SEO} containerPadding="pt-5 md:pt-10 pb-20">
            <div className="w-full">
                <div className={`mb-8 ${loadingClass}`}>
                    <CarouselSection
                        data={relatedProducts}
                        activeProducts={[wheelID, tireID]}
                        activeKey={activeCarouselKey}
                        onSelect={onSelectHandler}
                    />
                </div>
                <div className="w-full lg:grid lg:grid-cols-3 gap-32 border-t border-gray-50 pt-8">
                    <div className="col-span-2">
                        <div className={`grid sm:grid-cols-2 gap-10 sm:gap-20 ${loadingClass}`}>
                            <PreviewProduct product={selectedWheel} />
                            <PreviewProduct product={selectedTire} />
                        </div>
                    </div>
                    <div>
                        <div className="sticky top-5 mt-10 sm:mt-20 lg:mt-0">
                            <div className="pb-5">
                                <PackagePrice total={totalPrice} />
                            </div>
                            <div className="border-t border-gray-80 pt-5">
                                <h3 className="mb-2 font-semibold">Your Vehicle Data</h3>
                                <WheelTirePackageForm
                                    tire={selectedTire}
                                    wheel={selectedWheel}
                                    spare={addSpare}
                                    onSpareChange={onSpareChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<Props, QueryProps> = async ({ query: queryParams }) => {
    const query = queryParams as StringMap;
    const { wheel, tire } = query;

    const [wheelProduct, tireProduct, relatedProducts] = await fetchProducts(wheel, tire);

    return { props: { wheelProduct, tireProduct, relatedProducts } };
};

export default PackagePage;
