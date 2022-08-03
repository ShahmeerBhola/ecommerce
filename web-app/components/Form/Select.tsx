import React from 'react';

type Props = {
    name: string;
    value: string | string[];
    placeholder?: string;
    disabled?: boolean;
    borderColor?: 'border-red-200' | 'border-gray-901';
    onChange?: Forms.InputOnChange;
    onBlur?: Forms.InputOnBlur;
    options: Forms.FieldOption[];
};

const Select: React.FunctionComponent<Props> = ({
    name,
    value,
    placeholder,
    disabled,
    borderColor = 'border-gray-901',
    onChange,
    onBlur,
    options,
}) => {
    return (
        <select
            name={name}
            className={`text-sm text-gray-902 placeholder-gray-902 p-3 focus:outline-none w-full h-50px bg-gray-50 border border-solid ${borderColor}`}
            value={value || placeholder}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
        >
            <option value={placeholder} disabled>
                {placeholder}
            </option>
            {options.map(({ value: _value, label }) => (
                <option value={_value} key={_value}>
                    {label}
                </option>
            ))}
        </select>
    );
};

export default Select;
