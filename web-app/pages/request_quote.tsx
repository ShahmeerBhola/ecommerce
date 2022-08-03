import React from 'react';
import Layout from '../components/Layout';
import { RequestQuoteForm } from '../components/Forms';
import { constructCanonicalUrl } from '../utils';

const QuoteRequestPage: React.FunctionComponent = () => {
  const title = 'Request a Quote';
  return (
    <Layout
      seoProps={{
        title,
        openGraph: {
          url: constructCanonicalUrl({ page: 'request_quote' }),
          title,
          description: 'Get in contact with us',
        },
      }}
      containerItemsPosition="items-stretch"
      containerClassName="flex-col"
      headerTitle={title}
    >
      <RequestQuoteForm />
    </Layout>
  );
};

export default QuoteRequestPage;
