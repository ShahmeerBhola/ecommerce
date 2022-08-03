import React, { FC, MouseEvent } from 'react';
import { useRouter } from 'next/router';

import { Tabs, TabItem } from './Tabs';
import Price from '../../../components/Price';
import Slider from '../../../components/Slider';
import { ProductImage } from '../../../components/Product';

const CAROUSEL_SETTINGS = [
    {
        breakpoint: 1280,
        settings: {
            slidesToShow: 4,
        },
    },
    {
        breakpoint: 1024,
        settings: {
            slidesToShow: 3,
        },
    },
    {
        breakpoint: 768,
        settings: {
            slidesToShow: 2,
        },
    },
    {
        breakpoint: 640,
        settings: {
            slidesToShow: 1.25,
        },
    },
];

interface CarouselItemData {
    id: number;
    name: string;
    price: number;
    featured_image: WordPress.Image | null;
    sale_price: number;
}

const CarouselItem: FC<{
    data: CarouselItemData | {};
    productType: string;
    activeProducts: number[];
    onSelect: (id: string, type: string) => void;
}> = ({ data, productType, activeProducts, onSelect }) => {
    const { name, price, sale_price, featured_image, id } = data as CarouselItemData;
    const [wheelID, tireID] = activeProducts;
    const isWheel = productType === 'wheel';

    const activeWheel = isWheel ? id : wheelID;
    const activeTire = !isWheel ? id : tireID;
    const currentID = isWheel ? wheelID : tireID;
    const isCurrentItem = currentID === id;

    const router = useRouter();

    const clickHandler = (e: MouseEvent<HTMLDivElement>): void => {
        e.preventDefault();

        if (isCurrentItem) return;

        router.push(
            {
                pathname: '/package',
                query: {
                    wheel: activeWheel,
                    tire: activeTire,
                },
            },
            undefined,
            { shallow: true },
        );

        if (onSelect) onSelect('' + id, productType);
    };

    return (
        <div className="px-2 h-full">
            <div
                className="border border-gray-50 rounded p-4 flex h-full relative overflow-hidden hover:bg-gray-50 cursor-pointer"
                onClick={clickHandler}
            >
                <ProductImage
                    image={featured_image}
                    wrapperClassName="w-16 flex-shrink-0"
                    style={{ maxHeight: '70px' }}
                />

                <div className="ml-4">
                    <h3>{name}</h3>
                    <Price price={price} salePrice={sale_price} />
                </div>

                {isCurrentItem && (
                    <div className="absolute bg-black inset-0 m-0 bg-opacity-50 z-20 flex justify-end items-end">
                        <span className="block p-2 text-sm text-gray-50">Viewing</span>
                    </div>
                )}
            </div>
        </div>
    );
};
export const Carousel: FC<{
    items: (CarouselItemData | {})[];
    productType: string;
    activeProducts: number[];
    onSelect: (id: string, type: string) => void;
}> = ({ items, ...props }) => {
    return (
        <Slider
            className="sos-alternatives"
            slidesToShow={4}
            infinite={false}
            arrows={true}
            // initialSlide={0}
            responsive={CAROUSEL_SETTINGS}
        >
            {items.map((itemData, key) => (
                <CarouselItem key={key} data={itemData} {...props} />
            ))}
        </Slider>
    );
};

export const CarouselSection: FC<{
    data: { wheels: (CarouselItemData | {})[]; tires: (CarouselItemData | {})[] };
    activeProducts: number[];
    activeKey: string;
    onSelect: (id: string, type: string) => void;
}> = ({ data, activeProducts, activeKey, onSelect }) => {
    return (
        <div className="w-full">
            <Tabs activeKey={activeKey}>
                {!!data.wheels.length && (
                    <TabItem key="wheel" title="Wheel Alternatives">
                        <Carousel
                            productType="wheel"
                            items={data.wheels}
                            activeProducts={activeProducts}
                            onSelect={onSelect}
                        />
                    </TabItem>
                )}
                {!!data.tires.length && (
                    <TabItem key="tire" title="Tire Alternatives">
                        <Carousel
                            productType="tire"
                            items={data.tires}
                            activeProducts={activeProducts}
                            onSelect={onSelect}
                        />
                    </TabItem>
                )}
            </Tabs>
        </div>
    );
};
