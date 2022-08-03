import React from 'react';

import Field from './Field';
import Text from '../Text';

type Props<IV> = {
    fields: Forms.Field<IV>[];
    hidden: boolean;
    label?: string;
    yMargin?: string;
    noXPadding?: boolean;
    children?: React.ReactNode;
    onChangeHandlers?: Forms.ChangeHandlers<IV>;
    onBlurHandlers?: Forms.ChangeHandlers<IV>;
    fieldOptions?: Forms.FieldOptions<IV>;
    disabledFields?: Forms.DisabledFields<IV>;
    overriddenFields?: Forms.OverriddenFields<IV>;
};

const FormSection = <IV,>({
    children,
    fields,
    label,
    yMargin,
    noXPadding,
    hidden = false,
    onChangeHandlers,
    onBlurHandlers,
    fieldOptions,
    disabledFields,
    overriddenFields,
}: Props<IV>): JSX.Element | null => {
    let yMarg = 'my-3';
    if (yMargin === '') {
        yMarg = '';
    } else if (yMargin) {
        yMarg = yMargin;
    }

    return hidden ? null : (
        <div className={`flex flex-wrap ${yMarg}`}>
            {!!label && (
                <Text color="text-gray-700" className="w-full mb-3 font-medium" size="text-lg">
                    {label}
                </Text>
            )}
            {fields.map(({ name: fieldName, type, placeholder, className, ...rest }) => {
                const name = fieldName as keyof IV;
                return (
                    <Field<IV>
                        key={name as string}
                        name={name as string}
                        type={type}
                        placeholder={placeholder}
                        className={className}
                        noXPadding={noXPadding}
                        onChange={onChangeHandlers && onChangeHandlers[name]}
                        onBlur={onBlurHandlers && onBlurHandlers[name]}
                        fieldOptions={fieldOptions && fieldOptions[name]}
                        disabled={disabledFields && disabledFields[name]}
                        overrideContent={overriddenFields && overriddenFields[name]}
                        {...rest}
                    />
                );
            })}
            {children}
        </div>
    );
};

export default FormSection;
