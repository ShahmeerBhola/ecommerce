import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Text from '../components/Text';
import Layout from '../components/Layout';
import { sendOrderConfirmationConversionEvent } from '../utils/googleAnalytics';

const OrderConfirmationPage: React.FunctionComponent = () => {
  const router = useRouter();
  const title = 'Order Confirmation';
  const orderId = router.query.order_id as string;

  useEffect(() => {
    if (orderId) {
      sendOrderConfirmationConversionEvent(orderId);
    }
  }, [orderId]);

  return (
    <Layout seoProps={{ title, noindex: true, nofollow: true }} headerTitle={title}>
      <Text color="text-black" className="py-20">
        Your order has been successfully received! Your order ID number is {orderId}
      </Text>
    </Layout>
  );
};

export default OrderConfirmationPage;
