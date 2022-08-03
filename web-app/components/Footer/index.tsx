import React, { FC } from 'react';
import NLink from 'next/link';
import { SocialIcon } from 'react-social-icons';
import Container from '../Container';
import config, { menu as baseMenuLinks } from '../../config';
import Text from '../Text';
import Logo from '../Logo';
import { RedDivider } from '../Divider';
import { constructUrl } from '../../utils';
import { NewsletterSubscribeForm } from '../Forms';
import CreditCardLogos from '../CreditCardLogos';

type StoreHourProps = {
    days: string;
    hours: string;
};

const Header: FC = ({ children }) => (
    <Text color="text-red-100" weight="font-extrabold" className="pb-0" size="text-sm">
        {children}
    </Text>
);

const Link: FC<{ href: string }> = ({ href, children }) => (
    <NLink href={href}>
        <a>
            <Text color="text-white" size="text-sm" className="pt-3">
                {children}
            </Text>
        </a>
    </NLink>
);

const StoreHour: FC<StoreHourProps> = ({ days, hours }) => (
    <Text size="text-sm" className="uppercase font-bold pt-5" color="text-gray-200">
        {days} &nbsp;<span className="text-white">{hours}</span>
    </Text>
);

const Footer: FC = () => {
    const {
        address,
        colors,
        socialMedia: { facebook, instagram, youtube },
    } = config;
    const socialMediaUrls = [facebook, instagram, youtube];

    const menuLinks: MenuLinkProps[] = [
        ...baseMenuLinks,
        {
            url: { page: 'faq' },
            text: 'FAQs',
        },
        {
            url: { page: 'brand_ambassadors' },
            text: 'Brand Ambassadors',
        },
    ];

    return (
        <Container bgColor="bg-gray-600" paddingY="py-5 md:py-8">
            <footer className="flex flex-wrap justify-between">
                <div className="w-full md:w-1/4 text-center my-5 md:my-0">
                    <Logo renderLink={false} />
                    <div className="mt-8">
                        {socialMediaUrls.map((url) => (
                            <SocialIcon
                                url={url}
                                bgColor={colors.white}
                                key={url}
                                style={{
                                    height: '30px',
                                    width: '30px',
                                }}
                                target="_blank"
                                className="mx-1"
                                rel="noopener noreferrer"
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-1/5 my-5 md:my-0">
                    <Header>Our Site</Header>
                    {menuLinks.map(({ url, text }) => (
                        <Link href={constructUrl(url)} key={url.page}>
                            {text}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-col w-full md:w-1/4 my-5 md:my-0">
                    <Header>Store Hours</Header>
                    <StoreHour days="Monday - Friday" hours="9:30-6" />
                    <StoreHour days="Saturday" hours="9:30-2" />
                    <RedDivider width="w-full" my="my-5" />
                    <Text size="text-sm" color="text-gray-200">
                        {address.streetAdress}
                        <br />
                        {address.city}, {address.state} {address.zipCode}
                    </Text>
                </div>
                <div className="flex flex-col w-full md:w-1/5 my-5 md:my-0">
                    <Header>Subscribe for News and Upcoming Events</Header>
                    <NewsletterSubscribeForm />
                </div>
                <CreditCardLogos height="h-25px" className="w-full justify-center mt-8" />
            </footer>
        </Container>
    );
};

export default Footer;
