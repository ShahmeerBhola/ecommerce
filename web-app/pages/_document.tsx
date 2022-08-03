import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { GoogleAnalyticsAndAdsScripts } from '../utils/googleAnalytics';
import { FacebookPixelScripts } from '../utils/facebookPixel';

export default class SOSDocument extends Document {
    render(): JSX.Element {
        return (
            <Html lang="en">
                <Head>
                    <GoogleAnalyticsAndAdsScripts />
                    <FacebookPixelScripts />
                    <script
                        type="text/javascript"
                        src="//cdn.callrail.com/companies/621552588/6ffbfeb977058844dd2f/12/swap.js"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
