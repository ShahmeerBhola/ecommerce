import React from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';

const PageNotFoundPage: React.FunctionComponent = () => (
  <Layout seoProps={{ title: 'Page Not Found' }} headerTitle="Oops! Page Not Found" containerPadding="py-5 md:py-20">
    <div className="w-full text-center mx-auto">
      <img className="m-auto" src="/images/page_not_found.jpg" alt="Page Not Found" />
      <Button className="mt-0 md:mt-10" link="/">
        Go Home
      </Button>
    </div>
  </Layout>
);

export default PageNotFoundPage;
