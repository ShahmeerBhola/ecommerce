import React from 'react';

import Text from '../Text';

type Props = {
    name: string;
    type: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    overrideContent?: () => JSX.Element;
    borderColor?: 'border-red-200' | 'border-gray-901';
    onChange?: Forms.InputOnChange;
    onBlur?: Forms.InputOnBlur;
    blankOptionsFallbackText?: string;
    options?: Forms.FieldOption[];
};

const Input: React.FunctionComponent<Props> = ({
    name,
    type,
    value,
    placeholder,
    disabled,
    overrideContent,
    borderColor = 'border-gray-901',
    onChange,
    onBlur,
    blankOptionsFallbackText,
    options,
}) => {
    const baseStyle = 'text-sm text-gray-902 placeholder-gray-902 p-3 focus:outline-none';
    const inputStyle = `${baseStyle} w-full h-50px bg-gray-50 border border-solid ${borderColor}`;
    const textAreaStyle = `${baseStyle} block w-full h-175px bg-gray-50 border border-solid ${borderColor}`;
    const checkboxRadioStyle = `${baseStyle} mr-5`;

    if (type === 'radio') {
        // Radio buttons seem to be a bug in Formik..
        // see here for Github Issue https://github.com/jaredpalmer/formik/issues/1024
        // and here for a solution https://codesandbox.io/s/88jqoy4qvl
        const radioOptions = options as Forms.FieldOption[];

        if (overrideContent) {
            return overrideContent();
        }

        if (radioOptions.length === 0) {
            return <Text>{blankOptionsFallbackText}</Text>;
        }

        return (
            <>
                {placeholder && <Text>{placeholder}</Text>}
                {radioOptions.map(({ value: radioValue, label: radioLabel }) => (
                    <div key={radioValue}>
                        <label htmlFor={`${name}_${radioValue}`}>
                            <input
                                id={`${name}_${radioValue}`}
                                name={name}
                                type="radio"
                                disabled={disabled}
                                value={radioValue}
                                defaultChecked={value === radioValue}
                                onChange={onChange}
                                onBlur={onBlur}
                                className={checkboxRadioStyle}
                            />
                            {radioLabel}
                        </label>
                    </div>
                ))}
            </>
        );
    } else if (type === 'checkbox') {
        // Formik checkboxes are really stubborn...
        // https://github.com/formium/formik/issues/602
        return (
            <>
                <input
                    name={name}
                    type={type}
                    value={value}
                    disabled={disabled}
                    defaultChecked={(value as any) as boolean}
                    className={checkboxRadioStyle}
                    placeholder={placeholder}
                    onChange={onChange}
                    onBlur={onBlur}
                />
                <label htmlFor={name}>{placeholder}</label>
            </>
        );
    } else if (type === 'textarea') {
        return (
            <textarea
                name={name}
                rows={4}
                value={value}
                placeholder={placeholder}
                className={textAreaStyle}
                onChange={onChange}
                onBlur={onBlur}
            />
        );
    }

    return (
        <input
            name={name}
            type={type}
            value={value}
            disabled={disabled}
            className={inputStyle}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
};

export default Input;
