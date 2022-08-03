import { DefaultSeoProps } from 'next-seo';
import { NodeOptions as SentryOptions } from '@sentry/node';

type SocialMediaSource = 'facebook' | 'instagram' | 'youtube';
type SocialMediaObject = {
    [key in SocialMediaSource]: string;
};
type ColorPalette = {
    [key in Styles.ColorHeyKeys]: Styles.ColorHexCodes;
};

type CategorySlugs = {
    wheelsAndTires: string;
    tires: string;
    wheels: string;
    wheelAccessories: string;
    ledLighting: string;
    suspension: string;
    apparel: string;
};

type AddressObject = {
    streetAdress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: string;
    longitude: string;
};

type Config = {
    isProd: boolean;
    siteName: string;
    logoUrl: string;
    url: string;
    address: AddressObject;
    phoneNumber: string;
    email: string;
    sentry: SentryOptions;
    stripe: {
        publishableKey: string;
    };
    enableNewRelic: boolean;
    googleAnalyticsTrackingID: string | null;
    googleAdsConversionID: string | null;
    facebookPixelID: string | null;
    product: {
        placeholderImagePath: string;
    };
    socialMedia: SocialMediaObject;
    seo: DefaultSeoProps;
    defaultCountryCode: string;
    defaultCurrencyCode: string;
    defaultCurrencyCodeSymbol: string;
    defaultShippingMethodId: string;
    colors: ColorPalette;
    paginationPagesToShow: number;
    categorySlugs: CategorySlugs;
};

let config: Config;
let siteUrl: string;
const sentryDsn = process.env.SENTRY_DSN;

const siteName = 'Standout Specialties';
const logoUrl = 'https://storage.googleapis.com/standout-specialties-public-assets/logo.png';
const phoneNumber = '6104263025';
const email = 'aaron@standoutspecialties.com';
const siteDescription =
    'Stand from the Competition. Browse our collection of wheel and tire packages. Financing Available. Free shipping on all orders. $100 discount on wheel and tire packages with local pickup. Shop and save';
const socialMedia: SocialMediaObject = {
    facebook: 'https://www.facebook.com/standoutspecialties',
    instagram: 'https://www.instagram.com/standoutspecialties',
    youtube: 'https://www.youtube.com/channel/UC_L8_2r214VcNWAHeV8nMXw',
};
const address = {
    streetAdress: '1107 N Reading Rd',
    city: 'Stevens',
    state: 'PA',
    zipCode: '17578',
    country: 'US',
    latitude: '40.207820',
    longitude: '-76.135940',
};
const placeholderImagePath = '/images/product_image_placeholder.jpg';

// Useful when we need to manually use colors somewhere where we cannot use css classes (like <svg fill="<color>"> for example)
const colors: ColorPalette = {
    white: '#FFFFFF',
    'red-100': '#F23939',
    'red-200': '#CF0E0E',
    'gray-50': '#F3F3F3',
    'gray-75': '#DBDBDB',
    'gray-80': '#DFE5F0',
    'gray-90': '#C5C5C5',
    'gray-100': '#8F96A3',
    'gray-200': '#7A7A7A',
    'gray-300': '#505A64',
    'gray-400': '#3A3A3a',
    'gray-500': '#3C3030',
    'gray-600': '#131313',
    'gray-700': '#0E0E0E',
    'gray-800': '#6A6A6A',
    'gray-900': '#969696',
    'gray-901': '#CCD1D9',
    'gray-902': '#7C8186',
    black: '#1C1C1C',
};

const categorySlugs: CategorySlugs = {
    wheelsAndTires: 'wheels-and-tires',
    tires: 'tires',
    wheels: 'wheels',
    suspension: 'suspension',
    wheelAccessories: 'wheel-accessories',
    ledLighting: 'led-lighting',
    apparel: 'apparel',
};

if (process.env.NODE_ENV === 'production') {
    siteUrl = 'https://standoutspecialties.com';

    config = {
        isProd: true,
        logoUrl,
        siteName,
        url: siteUrl,
        address,
        phoneNumber,
        email,
        socialMedia,
        sentry: {
            dsn: sentryDsn,
            environment: 'production',
            enabled: true,
        },
        stripe: {
            publishableKey: 'pk_live_yixqPGwDr9CIPn02jjBe8hoZ00xkBX8ykC',
        },
        enableNewRelic: true,
        googleAnalyticsTrackingID: 'UA-166809381-1',
        googleAdsConversionID: 'AW-479563831',
        facebookPixelID: '373923170727343',
        product: {
            placeholderImagePath,
        },
        seo: {
            description: siteDescription,
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: siteUrl,
                site_name: siteName,
                description: siteDescription,
            },
        },
        defaultCountryCode: 'US',
        defaultCurrencyCode: 'USD',
        defaultCurrencyCodeSymbol: '$',
        defaultShippingMethodId: 'standard-shipping',
        colors,
        paginationPagesToShow: 5,
        categorySlugs,
    };
} else if (process.env.NODE_ENV === 'test') {
    siteUrl = 'https://dev.standoutspecialties.com';

    config = {
        isProd: false,
        logoUrl,
        siteName,
        url: siteUrl,
        address,
        phoneNumber,
        email,
        socialMedia,
        sentry: {
            dsn: sentryDsn,
            environment: 'staging',
            enabled: false,
        },
        stripe: {
            publishableKey: 'pk_test_1XggaqvGHGo02QycFUVCPxwc00To6FLj5u',
        },
        enableNewRelic: false,
        googleAnalyticsTrackingID: null,
        googleAdsConversionID: null,
        facebookPixelID: null,
        product: {
            placeholderImagePath,
        },
        seo: {
            description: siteDescription,
            // don't want to index/follow staging site..
            // https://github.com/garmeeh/next-seo#dangerouslysetallpagestonoindex
            // https://github.com/garmeeh/next-seo#dangerouslysetallpagestonofollow
            dangerouslySetAllPagesToNoIndex: true,
            dangerouslySetAllPagesToNoFollow: true,
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: siteUrl,
                site_name: siteName,
                description: siteDescription,
            },
        },
        defaultCountryCode: 'US',
        defaultCurrencyCode: 'USD',
        defaultCurrencyCodeSymbol: '$',
        defaultShippingMethodId: 'standard-shipping',
        colors,
        paginationPagesToShow: 5,
        categorySlugs,
    };
} else {
    siteUrl = 'https://standoutspecialties.local';

    config = {
        isProd: false,
        logoUrl,
        siteName,
        url: siteUrl,
        address,
        phoneNumber,
        email,
        socialMedia,
        sentry: {
            dsn: sentryDsn,
            environment: 'development',
            enabled: false,
        },
        stripe: {
            publishableKey: 'pk_test_1XggaqvGHGo02QycFUVCPxwc00To6FLj5u',
        },
        enableNewRelic: false,
        googleAnalyticsTrackingID: null,
        googleAdsConversionID: null,
        facebookPixelID: null,
        product: {
            placeholderImagePath,
        },
        seo: {
            description: siteDescription,
            // don't want to index/follow staging site..
            // https://github.com/garmeeh/next-seo#dangerouslysetallpagestonoindex
            // https://github.com/garmeeh/next-seo#dangerouslysetallpagestonofollow
            dangerouslySetAllPagesToNoIndex: true,
            dangerouslySetAllPagesToNoFollow: true,
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: siteUrl,
                site_name: siteName,
                description: siteDescription,
            },
        },
        defaultCountryCode: 'US',
        defaultCurrencyCode: 'USD',
        defaultCurrencyCodeSymbol: '$',
        defaultShippingMethodId: 'standard-shipping',
        colors,
        paginationPagesToShow: 5,
        categorySlugs,
    };
}

const menu: MenuLinkProps[] = [
    {
        url: { page: 'store' },
        text: 'Store',
    },
    {
        url: { page: 'brands' },
        text: 'Brands',
    },
    {
        url: { page: 'request_quote' },
        text: 'Request Quote',
    },
    {
        url: { page: 'contact' },
        text: 'Contact',
    },
];

export default config;
export { menu };
