import React from 'react';
import { useToasts } from 'react-toast-notifications';
import Form from '../../components/Form';
import WordPressClient from '../../utils/clients/wordpress';
import * as newsletterSignup from '../../utils/forms/newsletterSignup';

type Props = {
    successMessage?: string;
    errorMessage?: string;
    onSubmitSucess?: () => void;
    emailClassName?: string;
    submitClassName?: string;
};

const NewsletterSubscribe: React.FunctionComponent<Props> = ({
    successMessage = 'There was a problem subscribing, please try again',
    errorMessage = 'Thanks for subscribing!',
    onSubmitSucess,
    emailClassName = 'w-full',
    submitClassName = 'w-full',
}) => {
    const { addToast } = useToasts();
    return (
        <Form<newsletterSignup.InitialValues>
            initialValues={newsletterSignup.initialValues}
            form={newsletterSignup.definition(emailClassName, submitClassName)}
            validationSchema={newsletterSignup.validationSchema}
            onSubmit={async ({ email }, { setSubmitting, resetForm }): Promise<void> => {
                const successful = await WordPressClient.newsletterSubscribe(email);
                if (!successful) {
                    addToast(errorMessage, { appearance: 'error' });
                } else {
                    addToast(successMessage, { appearance: 'success' });
                    if (onSubmitSucess) {
                        onSubmitSucess();
                    }

                    resetForm();
                }
                setSubmitting(false);
            }}
        />
    );
};

export default NewsletterSubscribe;
