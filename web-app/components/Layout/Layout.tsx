import React, { FC } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import Header from '../Header';
import Footer from '../Footer';
import { SearchBar } from '../Search';
import Cont from '../Container';
import BarLoader from '../Loading';

type Props = {
    transparentNav?: boolean;
    useContainer?: boolean;
    containerClassName?: string;
    containerItemsPosition?: Styles.ItemsPosition;
    containerPadding?: string;
    bgColor?: Styles.BackgroundColors;
    headerTitle?: string;
    pageLoading?: boolean;
    seoProps?: NextSeoProps;
    landingPage?: boolean;
};

const Layout: FC<Props> = ({
    children,
    transparentNav = false,
    useContainer = true,
    bgColor,
    containerClassName,
    containerItemsPosition = 'items-center',
    containerPadding = 'py-5 md:py-10',
    headerTitle,
    pageLoading = false,
    seoProps,
    landingPage = false,
}) => {
    const Loading = (): React.ReactElement => {
        if (pageLoading) {
            return <BarLoader />;
        }
        return <>{children}</>;
    };

    const Container = (): JSX.Element => {
        if (useContainer) {
            const classNames = `flex ${containerItemsPosition} flex-grow flex-1`;
            return (
                <Cont
                    bgColor={bgColor}
                    className={`${classNames} ${containerClassName ? ` ${containerClassName}` : ''}`}
                    paddingY={containerPadding}
                >
                    <Loading />
                </Cont>
            );
        }
        return <Loading />;
    };

    const SEOWrapper: React.FunctionComponent = ({ children }) => (
        <>
            <NextSeo {...seoProps} />
            {children}
        </>
    );

    if (landingPage) {
        return <SEOWrapper>{children}</SEOWrapper>;
    }

    return (
        <SEOWrapper>
            <div className="flex flex-col justify-between min-h-screen relative">
                <Header transparent={transparentNav} title={headerTitle} />
                <Container />
                <Footer />
                <SearchBar />
            </div>
        </SEOWrapper>
    );
};

export default Layout;
