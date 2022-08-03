import React from 'react';
import { FormikHelpers } from 'formik';
import { useToasts } from 'react-toast-notifications';
import Form from '../../components/Form';
import WordPressClient from '../../utils/clients/wordpress';
import { sendSentryEvent } from '../../utils';
import { sendContactFormConversionEvent } from '../../utils/googleAnalytics';
import * as contactForm from '../../utils/forms/contact';

type InitialValues = contactForm.InitialValues;

const ContactForm: React.FunctionComponent = () => {
  const { addToast } = useToasts();

  const onSubmit = async (
    data: InitialValues,
    { setSubmitting, resetForm }: FormikHelpers<InitialValues>,
  ): Promise<void> => {
    const successful = await WordPressClient.contactFormSubmission(data);
    if (successful) {
      resetForm();
      addToast("Thanks for contacting us. We'll be in touch soon.", { appearance: 'success' });
      sendContactFormConversionEvent();
    } else {
      sendSentryEvent('Contact Form Submission Failure', data);
      addToast('There was an issue, please try again', { appearance: 'error' });
    }
    setSubmitting(false);
  };

  return (
    <Form<InitialValues>
      initialValues={contactForm.initialValues}
      form={contactForm.definition}
      validationSchema={contactForm.validationSchema}
      onSubmit={onSubmit}
    />
  );
};

export default ContactForm;
