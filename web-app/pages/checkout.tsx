import React, { useContext } from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { CheckoutForm } from '../components/Forms';
import { CartContext, EmptyCartMessage } from '../components/Cart';
import WordPressClient from '../utils/clients/wordpress';
import config from '../config';
import { cartIsEmpty } from '../utils';

type Props = {
  shippingCountries: StringMap;
  sellingCountries: StringMap;
  shippingStates: StringMap;
  sellingStates: StringMap;
  brandAmbassadors: WordPress.BrandAmbassador[];
};

const CheckoutPage: React.FunctionComponent<Props> = (props) => {
  const { lineItems, wheelTirePackages, hydratingLineItems } = useContext(CartContext);
  const title = 'Checkout';
  const isEmpty = cartIsEmpty(lineItems, wheelTirePackages);

  let extraProps;

  if (isEmpty && !hydratingLineItems) {
    extraProps = {
      containerItemsPosition: 'items-center' as Styles.ItemsPosition,
      containerPadding: 'py-5',
    };
  } else {
    extraProps = {
      containerItemsPosition: 'items-top' as Styles.ItemsPosition,
      useContainer: false,
    };
  }

  return (
    <Layout
      seoProps={{ title, noindex: true, nofollow: true }}
      headerTitle={title}
      pageLoading={hydratingLineItems}
      {...extraProps}
    >
      {isEmpty ? <EmptyCartMessage /> : <CheckoutForm {...props} />}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const {
    shipping_countries,
    selling_countries,
    shipping_states,
    selling_states,
    brand_ambassadors,
  } = await WordPressClient.getCheckoutPageData(config.defaultCountryCode);

  return {
    props: {
      shippingCountries: shipping_countries,
      sellingCountries: selling_countries,
      shippingStates: shipping_states,
      sellingStates: selling_states,
      brandAmbassadors: brand_ambassadors,
    },
  };
};

export default CheckoutPage;
