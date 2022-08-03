import React from 'react';
import Layout from '../components/Layout';
import Text from '../components/Text';
import { BrandAmbassadorForm } from '../components/Forms';
import { constructCanonicalUrl } from '../utils';

const BrandAmbassadorsPage: React.FunctionComponent = () => {
  const title = 'Become a Brand Ambassador';
  return (
    <Layout
      seoProps={{
        title,
        openGraph: {
          url: constructCanonicalUrl({ page: 'brand_ambassadors' }),
          title,
          description: 'Learn more on how you can become a Standout Specialties brand ambassador',
        },
      }}
      containerItemsPosition="items-stretch"
      containerClassName="flex-col"
      headerTitle={title}
    >
      <Text>
        Whats up future brand ambassadors, as you all know this industry has a huge market and we want to share it with
        you! There are some rules and requirements to being a STANDOUT SPECIALTIES brand ambassador but there is also
        going to be some return and reward as well! Some of the things we would like to see from you guys are, post
        shared, Standout Specialties tagged in instagram/Facebook pictures, getting traffic to our website, and of
        course making your own sales!
      </Text>
      <br />
      <Text>
        All ambassadors will gain points back per referral and points equal store credit! The more you promote and the
        more active you are the more you earn! THERE IS NO CAP!
      </Text>
      <BrandAmbassadorForm />
    </Layout>
  );
};

export default BrandAmbassadorsPage;
