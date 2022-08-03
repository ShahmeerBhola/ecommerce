import React, { FC } from 'react';
import Head from 'next/head';
import App, { AppProps } from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import { DefaultSeo, LogoJsonLd, LocalBusinessJsonLd, SocialProfileJsonLd, CorporateContactJsonLd } from 'next-seo';
import {
    init as sentryInit,
    withScope as sentryWithScope,
    captureException as sentryCaptureException,
} from '@sentry/node';
import { ToastProvider } from 'react-toast-notifications';

import config from '../config';
import { pageview as googleAnalyticsPageView } from '../utils/googleAnalytics';

import NewRelicMonitoring from '../components/NewRelicMonitoring';
import { CartProvider } from '../components/Cart';
import { SelectedWheelProvider } from '../components/SelectedWheel';
import { SearchBarProvider } from '../components/Search';
import { PageDoesNotExist, PageFallback } from '../components/Layout';

import '../public/styles/global.scss';

sentryInit(config.sentry);
NProgress.configure({ showSpinner: false });

export default class SOSApp extends App {
    constructor(props: AppProps) {
        super(props);

        // https://stackoverflow.com/a/55041365/3902555
        Router.events.on('routeChangeStart', this._onRouteChangeStart);
        Router.events.on('routeChangeComplete', this._onRouteChangeComplete);
        Router.events.on('routeChangeError', this._onRouteChangeError);
    }

    _onRouteChangeStart(_url: string): void {
        NProgress.start();
    }

    _onRouteChangeComplete(url: string): void {
        // make sure we scroll to top of page when using Router.push
        // https://github.com/vercel/next.js/issues/3249#issuecomment-436568081
        window.scrollTo(0, 0);
        NProgress.done();
        googleAnalyticsPageView(url);
    }

    _onRouteChangeError(_url: string): void {
        NProgress.done();
    }

    componentWillUnmount(): void {
        Router.events.off('routeChangeStart', this._onRouteChangeStart);
        Router.events.off('routeChangeComplete', this._onRouteChangeComplete);
        Router.events.off('routeChangeError', this._onRouteChangeError);
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        sentryWithScope((scope) => {
            scope.setExtras(errorInfo);
            sentryCaptureException(error);
        });

        super.componentDidCatch(error, errorInfo);
    }

    render(): JSX.Element {
        const { Component, pageProps, router } = this.props;
        const { url, seo, siteName, colors, phoneNumber, logoUrl, socialMedia, address, enableNewRelic } = config;
        const red = colors['red-100'];
        // https://web.dev/font-display/?utm_source=lighthouse&utm_medium=devtools
        const googleFontUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';

        const Content: FC = () => {
            if (router.isFallback) {
                return <PageFallback />;
            }

            if (pageProps?.status === 404) {
                return <PageDoesNotExist />;
            }

            return <Component {...pageProps} key={router.route} />;
        };

        // https://reacttricks.com/animating-next-page-transitions-with-framer-motion/
        // exitBeforeEnter: AnimatePresence will only render one component at a time. The exiting component will finished its exit animation before the entering component is rendered
        return (
            <>
                <DefaultSeo titleTemplate={`${config.siteName} | %s`} {...config.seo} />
                {config.isProd && (
                    <>
                        <LocalBusinessJsonLd
                            type="AutoPartsStore"
                            id={url}
                            name={siteName}
                            description={seo.description as string}
                            url={url}
                            telephone={phoneNumber}
                            address={{
                                streetAddress: address.streetAdress,
                                addressLocality: address.city,
                                addressRegion: address.state,
                                postalCode: address.zipCode,
                                addressCountry: address.country,
                            }}
                            geo={{
                                latitude: address.latitude,
                                longitude: address.longitude,
                            }}
                            images={[
                                'https://storage.googleapis.com/standout-specialties-public-assets/truck1.jpg',
                                'https://storage.googleapis.com/standout-specialties-public-assets/truck2.jpg',
                            ]}
                            openingHours={[
                                {
                                    opens: '09:30',
                                    closes: '18:00',
                                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                },
                                {
                                    opens: '09:30',
                                    closes: '14:00',
                                    dayOfWeek: 'Saturday',
                                },
                            ]}
                        />
                        <SocialProfileJsonLd
                            type="Organization"
                            name={siteName}
                            url={url}
                            sameAs={[socialMedia.facebook, socialMedia.instagram, socialMedia.youtube]}
                        />
                        <LogoJsonLd logo={logoUrl} url={url} />
                        <CorporateContactJsonLd
                            url={url}
                            logo={logoUrl}
                            contactPoint={[
                                {
                                    telephone: phoneNumber,
                                    contactType: 'Customer Service',
                                    areaServed: ['US'],
                                    availableLanguage: ['English'],
                                    contactOption: 'TollFree',
                                },
                            ]}
                        />
                    </>
                )}
                <Head>
                    {/* https://github.com/gokulkrishh/awesome-meta-and-manifest#meta-tags */}
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1" />

                    <link rel="preload" href={googleFontUrl} as="style" />
                    <link rel="stylesheet" href={googleFontUrl} />

                    {/* https://web.dev/optimize-lcp/#establish-third-party-connections-early */}
                    {[
                        'https://m.stripe.com',
                        'https://js.stripe.com',
                        'https://google-analytics.com',
                        'https://m.stripe.network',
                        'https://js-agent.newrelic.com',
                    ].map((url: string) => (
                        <React.Fragment key={url}>
                            <link rel="preconnect" href={url} />
                            <link rel="dns-prefetch" href={url} />
                        </React.Fragment>
                    ))}

                    {enableNewRelic && <NewRelicMonitoring />}

                    <meta name="theme-color" content={colors.white} />
                    <meta name="application-name" content={siteName} />
                    <meta name="full-screen" content="yes" />
                    <meta name="browsermode" content="application" />
                    <meta name="nightmode" content="enable/disable" />
                    <meta name="layoutmode" content="fitscreen/standard" />
                    <meta name="imagemode" content="force" />
                    <meta name="screen-orientation" content="portrait" />

                    <link href="/manifest.json" rel="manifest" />

                    {/* Main Link Tags */}
                    <link rel="shortcut icon" type="image/x-icon" href="/icons/favicon.ico" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-title" content={siteName} />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    {/* <link rel="apple-touch-startup-image" href="touch-icon-start-up-320x480.png" /> */}
                    <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/icons/apple-touch-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-touch-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-touch-icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
                    <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-touch-icon-114x114.png" />
                    <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
                    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color={red} />

                    {/* Android */}
                    <meta name="mobile-web-app-capable" content="yes" />

                    {/* Windows */}
                    <meta name="msapplication-navbutton-color" content={red} />
                    <meta name="msapplication-tooltip" content={siteName} />
                    <meta name="msapplication-starturl" content="/" />
                    <meta name="msapplication-TileColor" content="#2b5797" />
                    <meta name="msapplication-tap-highlight" content="no" />
                    <meta name="msapplication-TileImage" content="/icons/mstile-144x144.png" />
                    <meta name="msapplication-config" content="browserconfig.xml" />
                </Head>

                <ToastProvider autoDismiss autoDismissTimeout={5000}>
                    <CartProvider>
                        <SelectedWheelProvider>
                            <SearchBarProvider>
                                <Content />
                            </SearchBarProvider>
                        </SelectedWheelProvider>
                    </CartProvider>
                </ToastProvider>
            </>
        );
    }
}
