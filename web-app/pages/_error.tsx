// https://github.com/vercel/next.js/blob/canary/examples/with-sentry/pages/_error.js
import React from 'react';
import { NextPage, NextPageContext } from 'next';
import NextErrorComponent, { ErrorProps } from 'next/error';
import { captureException as sentryCaptureException } from '@sentry/node';
import PageNotFound from './404';
import Text from '../components/Text';
import Layout from '../components/Layout';

type Props = ErrorProps & {
  hasGetInitialPropsRun?: boolean;
  err?: Error | null;
};

const SOSError: NextPage<Props> = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    sentryCaptureException(err);
  }

  if (statusCode === 404) {
    return <PageNotFound />;
  }

  return (
    <Layout seoProps={{ title: 'Oh no!' }}>
      <Text className="py-20">There was an unknown error, oh no!</Text>
    </Layout>
  );
};

SOSError.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const { res, asPath, err } = ctx;
  const errorInitialProps = (await NextErrorComponent.getInitialProps(ctx)) as Props;

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;

  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (res?.statusCode === 404) {
    // Opinionated: do not record an exception in Sentry for 404
    return { statusCode: 404 };
  }
  if (err) {
    sentryCaptureException(err);
    return { ...errorInitialProps, err };
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  sentryCaptureException(new Error(`_error.js getInitialProps missing data at path: ${asPath}`));

  return { ...errorInitialProps, err };
};

export default SOSError;
