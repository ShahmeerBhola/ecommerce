import React, { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getQueryParams, constructProductUrl } from '../../utils';

type Props = {
    slug: string;
    className?: string;
    variant?: string;
    includeQueryParams?: boolean;
};

const ProductLink: FC<Props> = ({ slug, children, className, variant, includeQueryParams = false }) => {
    const router = useRouter();
    const queryParams = includeQueryParams ? getQueryParams(router) : {};
    const variantParam: StringMap = variant ? { variant } : {};

    return (
        <Link href={constructProductUrl({ slug, queryParams: { ...queryParams, ...variantParam } })}>
            <a className={className}>{children}</a>
        </Link>
    );
};

export default ProductLink;
