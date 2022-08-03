import React from 'react';
import { FormikHelpers } from 'formik';
import { useToasts } from 'react-toast-notifications';
import Form from '../Form';
import WordPressClient from '../../utils/clients/wordpress';
import * as requestQuote from '../../utils/forms/requestQuote';
import { sendSentryEvent, mapValuesToSelectOptions, withToast } from '../../utils';
import { sendRequestForQuoteEvent } from '../../utils/googleAnalytics';

type State = {
  years: string[];
  makes: string[];
  models: string[];
  trims: string[];
};

type RequestQuoteIV = requestQuote.InitialValues;

class RequestQuoteForm extends React.Component<ReturnType<typeof useToasts>, State> {
  state = {
    years: [],
    makes: [],
    models: [],
    trims: [],
  };

  componentDidMount = async (): Promise<void> => {
    const years = await WordPressClient.getTruckYears();
    this.setState({ years });
  };

  onSubmit = async (
    data: RequestQuoteIV,
    { setSubmitting, resetForm }: FormikHelpers<RequestQuoteIV>,
  ): Promise<void> => {
    const { addToast } = this.props;
    const successful = await WordPressClient.quoteRequestFormSubmission(data);
    if (successful) {
      resetForm();
      addToast("Thanks for your quote request. We'll be in touch with you soon!", { appearance: 'success' });
      sendRequestForQuoteEvent();
    } else {
      sendSentryEvent('Request Quote Form Submission Failure', data);
      addToast('There was an issue, please try again', { appearance: 'error' });
    }
    setSubmitting(false);
  };

  render = (): JSX.Element => {
    const {
      state: { years, makes, models, trims },
      onSubmit,
    } = this;

    return (
      <Form<RequestQuoteIV>
        initialValues={requestQuote.initialValues}
        form={requestQuote.definition}
        validationSchema={requestQuote.validationSchema}
        onSubmit={onSubmit}
        fieldOptions={{
          year: mapValuesToSelectOptions(years),
          make: mapValuesToSelectOptions(makes),
          model: mapValuesToSelectOptions(models),
          trim: mapValuesToSelectOptions(trims),
        }}
        onChangeHandlers={{
          year: async (year: string): Promise<void> => {
            const makes = await WordPressClient.getTruckMakes(year);
            this.setState({ makes });
          },
          make: async (make: string, { year }: RequestQuoteIV): Promise<void> => {
            const models = await WordPressClient.getTruckModels(year, make);
            this.setState({ models });
          },
          model: async (model: string, { year, make }: RequestQuoteIV): Promise<void> => {
            const trims = await WordPressClient.getTruckTrims(year, make, model);
            this.setState({ trims });
          },
        }}
        disabledFields={{
          year: false,
          make: makes.length === 0,
          model: models.length === 0,
          trim: trims.length === 0,
        }}
      />
    );
  };
}

export default withToast<{}, State>(RequestQuoteForm);
