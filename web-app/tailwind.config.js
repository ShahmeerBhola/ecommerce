const { colors } = require('tailwindcss/defaultTheme'); // eslint-disable-line

module.exports = {
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
    purge: ['./components/**/*.{ts,tsx}', './config/**/*.{ts,tsx}', './pages/**/*.{ts,tsx,js}', './utils/**/*.{ts,tsx}'],
    theme: {
        fontFamily: {
            primary: ['Poppins', 'sans-serif'],
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
        },
        colors: {
            ...colors,
            white: '#FFFFFF',
            red: {
                100: '#F23939',
                200: '#CF0E0E',
            },
            gray: {
                50: '#F3F3F3',
                75: '#DBDBDB',
                80: '#DFE5F0',
                90: '#C5C5C5',
                100: '#8F96A3',
                200: '#7A7A7A',
                300: '#505A64',
                400: '#3A3A3a',
                500: '#3C3030',
                600: '#131313',
                700: '#0E0E0E',
                800: '#6A6A6A',
                900: '#969696',
                901: '#CCD1D9',
                902: '#7C8186',
            },
            black: '#1C1C1C',
        },
        extend: {
            borderWidth: {
                '3': '3px',
            },
            height: {
                '20px': '20px',
                '25px': '25px',
                '30px': '30px',
                '50px': '50px',
                '90px': '90px',
                '175px': '175px',
                '450px': '450px',
                cube: '395px',
            },
            width: {
                '20px': '20px',
                '25px': '25px',
                '450px': '450px',
                '1/6': '16.6666666%',
                '1/8': '12.5%',
            },
            maxWidth: {
                '512px': '512px',
                '640px': '640px',
                '1/4': '25%',
                '1/3': '33.33333%',
                '1/2': '50%',
            },
            maxHeight: {
                '6': '6rem',
                '200px': '200px',
            },
            margin: {
                '23rem': '23rem',
                '8rem': '8rem',
            },
            inset: {
                0: 0,
                5: '5%',
                '15px': '15px',
                '-11rem': '-11rem',
                '-13rem': '-13rem',
                '-25rem': '-25rem',
            },
            backgroundSize: {
                auto: 'auto',
                cover: 'cover',
                contain: 'contain',
                '50%': '50%',
                '0%': '0%',
            },
        },
    },
    variants: {
        backgroundColor: ['responsive', 'hover'],
        cursor: ['disabled'],
        opacity: ['disabled'],
    },
    plugins: [require('tailwind-scrollbar')],
};
