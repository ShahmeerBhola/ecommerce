import React from 'react';
import config from '../config';

const { facebookPixelID } = config;

// https://www.facebook.com/business/help/402791146561655?id=1205376682832142
const event = <P,>(eventName: string, params?: P): void => {
  if (facebookPixelID !== null) {
    if (params !== undefined) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
  }
};

export const addLineItemToCart = ({ sku, name, price }: WordPress.ProductBase, type = 'line_item'): void =>
  event<facebook.Pixel.AddToCartParameters>('AddToCart', {
    content_name: name,
    content_type: type,
    content_ids: [sku],
    value: price,
    currency: config.defaultCurrencyCode,
  });

export const addWheelTirePackageToCart = ({ wheel, tire, addOns }: Cart.WheelTirePackage): void => {
  const addWheelTirePackageItemToCart = (product: WordPress.ProductBase): void =>
    addLineItemToCart(product, 'wheel_tire_package');

  addWheelTirePackageItemToCart(wheel);
  addWheelTirePackageItemToCart(tire);
  addOns.map((addOn) => addWheelTirePackageItemToCart(addOn));
};

export const initiateCheckout = (): void => event('InitiateCheckout');
export const completePurchase = (params: facebook.Pixel.PurchaseParameters): void =>
  event<facebook.Pixel.PurchaseParameters>('Purchase', params);

export const FacebookPixelScripts: React.FunctionComponent = () => {
  {
    if (facebookPixelID !== null) {
      return (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
 fbq('init', '${facebookPixelID}');
fbq('track', 'PageView');
          `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              src={`https://www.facebook.com/tr?id=${facebookPixelID}&ev=PageView
&noscript=1`}
            />
          </noscript>
        </>
      );
    }
  }
  return null;
};
