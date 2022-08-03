import React, { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { GrayDivider } from '../Divider';
import { MobileSearchFilterArrowIcon } from '../Icons';
import Text from '../Text';
import { constructUrl, modifyQueryParam } from '../../utils';

export type ScrollMobileProps = {
    scroll?: boolean;
    mobile?: boolean;
};

export type Props = Search.Filter & ScrollMobileProps;

const FilterOptions: FC<Omit<Props, 'placeholder'>> = ({ options, queryKey, category, mobile = false, scroll }) => {
    const router = useRouter();

    const onOptionClick = (value: string, isActive: boolean): void => {
        if (category) {
            router.push(
                constructUrl({
                    page: 'category',
                    extra: value,
                    queryParams: router.query as StringMap,
                }),
            );
        } else {
            modifyQueryParam(router, queryKey, isActive ? null : value);
        }
    };

    const _OptionBox: FC<{ isActive: boolean; className?: string }> = ({ isActive, className }) => (
        <div className={`h-20px w-20px ${className} ${isActive ? ' bg-red-100' : ' bg-gray-80'}`}></div>
    );

    const _OptionText: FC<{ isActive: boolean; label: string }> = ({ isActive, label }) => (
        <Text size="text-sm" color={isActive ? 'text-black' : 'text-gray-100'}>
            {label}
        </Text>
    );

    const Option: FC<Forms.FieldOption> = ({ value, label }) => {
        const queryParamValue = router.query[queryKey];

        let isActive = false;
        if (queryParamValue === undefined) {
            isActive = false;
        } else if (queryParamValue === value) {
            isActive = true;
        } else if ((queryParamValue === 'true') === ((value as unknown) as boolean)) {
            isActive = true;
        }

        const OptionBox = (): JSX.Element => <_OptionBox isActive={isActive} className={mobile ? '' : 'mr-3'} />;
        const OptionText = (): JSX.Element => <_OptionText isActive={isActive} label={label} />;

        const Layout = (): JSX.Element => {
            if (mobile) {
                return (
                    <>
                        <OptionText />
                        <OptionBox />
                    </>
                );
            }
            return (
                <>
                    <OptionBox />
                    <OptionText />
                </>
            );
        };

        return (
            <div className="flex items-center mt-3 cursor-pointer" onClick={(): void => onOptionClick(value, isActive)}>
                <Layout />
            </div>
        );
    };

    const scrollClasses =
        'max-h-200px overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-80';

    return (
        <div className={`${scroll ? scrollClasses : ''}`}>
            {options.map(({ label, value }) => (
                <Option key={value} label={label} value={value} />
            ))}
        </div>
    );
};

const MobileFilter: FC<Props> = ({ placeholder, ...rest }) => {
    const [isOpen, toggleOpenState] = useState<boolean>(false);
    const onClick = (): void => toggleOpenState(!isOpen);

    return (
        <div>
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={onClick}>
                <Text color="text-black">{placeholder}</Text>
                <MobileSearchFilterArrowIcon direction={isOpen ? 'down' : 'right'} />
            </div>
            <GrayDivider my="my-0" />
            {isOpen && (
                <div className="px-4 py-3">
                    <FilterOptions {...rest} />
                </div>
            )}
        </div>
    );
};

const DesktopFilter: FC<Props> = ({ placeholder, ...rest }) => (
    <div className="flex-col">
        <Text color="text-red-100" className="mb-2">
            {placeholder}
        </Text>
        <FilterOptions {...rest} />
    </div>
);

const Filter: FC<Props> = ({ mobile = false, scroll = true, ...rest }) => {
    if (rest.options.length === 0) {
        return null;
    }

    const _Filt: FC<{ Component: FC<Props> }> = ({ Component }) => <Component scroll={scroll} {...rest} />;

    return mobile ? <_Filt Component={MobileFilter} /> : <_Filt Component={DesktopFilter} />;
};

export default Filter;
