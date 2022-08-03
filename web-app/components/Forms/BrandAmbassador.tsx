import React from 'react';
import { useToasts } from 'react-toast-notifications';
import Form from '../../components/Form';
import WordPressClient from '../../utils/clients/wordpress';
import * as brandAmbassador from '../../utils/forms/brandAmbassador';

const BrandAmbassadorForm: React.FunctionComponent = () => {
  const { addToast } = useToasts();
  return (
    <Form<brandAmbassador.InitialValues>
      initialValues={brandAmbassador.initialValues}
      form={brandAmbassador.definition}
      validationSchema={brandAmbassador.validationSchema}
      onSubmit={async (data, { setSubmitting, resetForm }): Promise<void> => {
        const successful = await WordPressClient.brandAmbassadorFormSubmission(data);
        if (!successful) {
          addToast('There was a problem subscribing, please try again', { appearance: 'error' });
        } else {
          addToast("Thanks for your interest in becoming a brand ambassador. We'll be in touch with you shortly!", {
            appearance: 'success',
          });
          resetForm();
        }
        setSubmitting(false);
      }}
    />
  );
};

export default BrandAmbassadorForm;
