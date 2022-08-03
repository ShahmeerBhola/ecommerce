import React from 'react';
import Text from '../Text';
import {
    productIsWheel,
    constructWheelDimension,
    constructTireDimension,
    productIsTire,
    productIsSuspension,
    constructSuspensionRange,
} from '../../utils';

type Props = {
    product: WordPress.Product;
};

type MetadataRowProps = {
    metaKey: string;
    value?: string;
};

const MetadataRow: React.FunctionComponent<MetadataRowProps> = ({ metaKey, value }) => (
    <div className="flex justify-between">
        <Text color="text-gray-100" size="text-sm">
            {metaKey}
        </Text>
        <Text color="text-black" size="text-sm" weight="font-bold" className="text-right">
            {value}
        </Text>
    </div>
);

const Metadata: React.FunctionComponent<Props> = ({ product }) => {
    const { categories, brand } = product;

    let rows: MetadataRowProps[] = [
        {
            metaKey: 'Brand',
            value: brand?.name || '-',
        },
    ];

    if (productIsWheel(categories)) {
        const metadata = product.metadata as WordPress.WheelMetadata;

        rows = [
            ...rows,
            {
                metaKey: 'Dimension',
                value: constructWheelDimension(metadata),
            },
            {
                metaKey: 'Color',
                value: metadata.Color ? `${metadata.Color.substring(0, 15)}...` : '',
            },
        ];
    } else if (productIsTire(categories)) {
        const metadata = product.metadata as WordPress.TireMetadata;

        rows = [
            ...rows,
            {
                metaKey: 'Dimension',
                value: constructTireDimension(metadata),
            },
            {
                metaKey: 'Load Rating',
                value: metadata['Load Range'],
            },
        ];
    } else if (productIsSuspension(categories)) {
        const metadata = product.metadata as WordPress.SuspensionMetadata;

        rows = [
            ...rows,
            {
                metaKey: 'Lift Size',
                value: metadata['Lift Size'],
            },
            {
                metaKey: 'Vehicle',
                value: constructSuspensionRange(metadata),
            },
        ];
    }

    return (
        <>
            {rows.map(({ metaKey, value }) => (
                <MetadataRow key={metaKey} metaKey={metaKey} value={value} />
            ))}
        </>
    );
};

export default Metadata;
