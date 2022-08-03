import React from 'react';
import Head from 'next/head';
import Error from '../../pages/_error';

const DoesNotExist: React.FunctionComponent = () => (
  <>
    <Head>
      <meta name="robots" content="noindex" />
    </Head>
    <Error statusCode={404} />
  </>
);

export default DoesNotExist;
