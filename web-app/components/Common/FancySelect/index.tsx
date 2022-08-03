import React, { FC, useState, useEffect, useRef } from 'react';

import { useOnClickOutside } from '../../../utils';

import './styles.scss';

type FancySelectOption = {
    value: string;
    label: string;
};

type Props = {
    label?: string;
    options: FancySelectOption[];
    onSelect?: (value: string) => void;
    defaultValue?: string;
    currentValue?: string | null;
    isPlain?: boolean;
};

export const FancySelect: FC<Props> = ({
    label,
    options,
    onSelect,
    defaultValue = '',
    currentValue = null,
    isPlain = false,
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [value, setValue] = useState<string | null>(currentValue);
    const [currentLabel, setCurrentLabel] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = useRef<any>();

    useOnClickOutside(ref, () => setShowOptions(false));

    const toggleOptions = (): void => {
        setShowOptions((state) => !state);
    };

    const selectValue = (_value: string): void => {
        setValue(_value);
        setShowOptions(false);
    };

    useEffect(() => {
        if (onSelect && value !== null) {
            onSelect(value);
        }

        setCurrentLabel((options.find(({ value: _value }) => _value === value) || {})?.label || defaultValue);
    }, [onSelect, value, setCurrentLabel, defaultValue, options]);

    const getActiveClass = (_value: string): string => (_value === value ? 'opacity-50' : '');
    const defaultOption = defaultValue ? { label: defaultValue, value: '' } : {};

    const appearanceClass = isPlain ? '' : 'border-2 border-gray-80 px-2 rounded';

    return (
        <div className="flex flex-col relative sos-fancy-select text-sm" ref={ref}>
            <div
                className={`flex flex-row align-center justify-center cursor-pointer select-none space-x-2 py-1 ${appearanceClass}`}
                onClick={toggleOptions}
            >
                {!!label && <div className="text-gray-200">{label}</div>}
                {!!currentLabel && <div className="text-red-100 sos-fancy-select__value">{currentLabel}</div>}
            </div>

            {showOptions && (
                <div className="sos-fancy-select__options bg-white shadow-md py-1 font-primary text-gray-100 text-sm font-normal">
                    {[defaultOption, ...options].map(({ label: _label, value: _value }, key) => (
                        <div
                            key={key}
                            className={`py-1 hover:bg-gray-50 px-3 cursor-pointer ${getActiveClass(_value || '')}`}
                            onClick={(): void => selectValue(_value || '')}
                        >
                            {_label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
