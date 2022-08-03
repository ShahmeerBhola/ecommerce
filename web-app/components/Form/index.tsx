import React from 'react';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import { useToasts } from 'react-toast-notifications';

import { sendSentryEvent, shouldHideFormSection } from '../../utils';

import Section from './Section';
import Submit from './Submit';
import InputGroup from './InputGroup';

type FormSubmitProps = {
    isSubmitting: boolean;
    isValid: boolean;
    noXPadding?: boolean;
};

type FormProps<IV> = {
    initialValues: IV;
    form: Forms.FormDefinition<IV>;
    validationSchema: Forms.YupValidationSchema<IV> | Forms.YupLazyValidationSchema<IV>;
    onSubmit: (data: IV, actions: FormikHelpers<IV>) => void | Promise<void>;
    isInitialValid?: boolean;
    onChangeHandlers?: Forms.ChangeHandlers<IV>;
    onBlurHandlers?: Forms.ChangeHandlers<IV>;
    fieldOptions?: Forms.FieldOptions<IV>;
    hiddenFormSectionConditions?: Forms.HiddenFormSectionCondition<IV>[];
    disabledFields?: Forms.DisabledFields<IV>;
    overriddenFields?: Forms.OverriddenFields<IV>;
    externalDisableSubmit?: boolean;
    additionalExternalSections?: Forms.FormSection<IV>[];
};

const Form = <IV,>(props: FormProps<IV>): JSX.Element => {
    const {
        initialValues,
        validationSchema,
        isInitialValid = true,
        onSubmit,
        form: { sections, submit, renderSubmitInsideSections = true },
        externalDisableSubmit = false,
        additionalExternalSections,
        hiddenFormSectionConditions = [],
        ...rest
    } = props;
    const { addToast } = useToasts();

    const FormSubmit: React.FunctionComponent<FormSubmitProps> = ({ isSubmitting, isValid, noXPadding }) => {
        const { className, loadingMessage, text, noBottomPadding } = submit;
        return (
            <InputGroup className={className} noBottomPadding={noBottomPadding} noXPadding={noXPadding}>
                <Submit
                    className={className}
                    isSubmitting={isSubmitting}
                    disabled={externalDisableSubmit || isSubmitting || !isValid}
                    loadingMessage={loadingMessage}
                >
                    {text}
                </Submit>
            </InputGroup>
        );
    };

    return (
        <Formik<IV>
            isInitialValid={isInitialValid}
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={(values, helpers): void => {
                try {
                    onSubmit(values, helpers);
                } catch (err) {
                    addToast('Oops, there was an unknown error. Try again', { appearance: 'error' });
                    sendSentryEvent('Unknown form submission exception', { ...props, values });
                    helpers.setSubmitting(false);
                }
            }}
        >
            {({ values, isSubmitting, isValid, handleSubmit }: FormikProps<IV>): JSX.Element => (
                <form onSubmit={handleSubmit}>
                    {sections.map(({ id, label, fields, noXPadding, ...sectionRest }, idx) => (
                        <Section<IV>
                            key={`${label}-${idx}`}
                            label={label}
                            hidden={shouldHideFormSection<IV>(hiddenFormSectionConditions, values, id)}
                            fields={fields}
                            noXPadding={noXPadding}
                            {...sectionRest}
                            {...rest}
                        >
                            {renderSubmitInsideSections && idx === sections.length - 1 ? (
                                <FormSubmit isSubmitting={isSubmitting} isValid={isValid} noXPadding={noXPadding} />
                            ) : null}
                        </Section>
                    ))}
                    {additionalExternalSections?.map(({ id, label, fields, ...sectionRest }, idx) => (
                        <Section<IV>
                            key={`${label}-${idx}`}
                            label={label}
                            fields={fields}
                            hidden={shouldHideFormSection<IV>(hiddenFormSectionConditions, values, id)}
                            {...sectionRest}
                            {...rest}
                        />
                    ))}
                    {!renderSubmitInsideSections ? <FormSubmit isSubmitting={isSubmitting} isValid={isValid} /> : null}
                </form>
            )}
        </Formik>
    );
};

export default Form;
