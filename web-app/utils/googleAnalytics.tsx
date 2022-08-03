import React from 'react';
import config from '../config';
import { isBrowserSide } from './';

const { googleAnalyticsTrackingID, googleAdsConversionID } = config;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
// https://github.com/vercel/next.js/tree/canary/examples/with-google-analytics
export const pageview = (url: string): void => {
  if (googleAnalyticsTrackingID !== null && isBrowserSide()) {
    window.gtag('config', googleAnalyticsTrackingID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
const event = (action: string, eventParams: any): void => {
  if (googleAnalyticsTrackingID !== null && isBrowserSide()) {
    window.gtag('event', action, eventParams);
  }
};

const conversionEvent = (sendTo: string, eventParams?: StringMap): void =>
  event('conversion', { send_to: sendTo, ...eventParams });

export const sendOrderConfirmationConversionEvent = (orderId: string): void =>
  conversionEvent('AW-479563831/zZZcCPqr3-gBELeg1uQB', { transaction_id: orderId });

export const sendContactFormConversionEvent = (): void => conversionEvent('AW-479563831/6i-DCKyL6-gBELeg1uQB');

export const sendRequestForQuoteEvent = (): void => conversionEvent('AW-479563831/C9PsCJv7_-gBELeg1uQB');

// https://developers.google.com/analytics/devguides/collection/gtagjs/enhanced-ecommerce
export const sendEnhancedEcommerceEvent = (
  eee: GoogleAnalytics.EnhancedEcommerceEvent,
  items: GoogleAnalytics.Product[],
): void => event(eee, { items });

export const sendEnhancedEcommercePurchaseEvent = (data: GoogleAnalytics.PurchaseEvent): void =>
  event('purchase', data);

export const sendEnhancedEcommerceCheckoutOptionEvent = (data: GoogleAnalytics.CheckoutProgressEvent): void =>
  event('set_checkout_option', data);

export const enhancedEcommerceLineItemListName = 'Line Items';
export const enhancedEcommerceWheelTirePackageListName = 'Wheel Tire Package';
export const enhancedEcommerceWheelTirePackageAddOnsListName = 'Wheel Tire Package Add Ons';

export const GoogleAnalyticsAndAdsScripts: React.FunctionComponent = () => {
  {
    if (googleAnalyticsTrackingID !== null && googleAdsConversionID !== null) {
      return (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsTrackingID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsTrackingID}', {
              page_path: window.location.pathname,
            });
            gtag('config', '${googleAdsConversionID}')
          `,
            }}
          />
        </>
      );
    }
  }
  return null;
};
