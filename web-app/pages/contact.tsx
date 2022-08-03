import React from 'react';
import { SocialIcon } from 'react-social-icons';
import { PhoneIcon, EmailIcon } from '../components/Icons';
import Layout from '../components/Layout';
import { ContactForm } from '../components/Forms';
import Text from '../components/Text';
import { constructCanonicalUrl, formatPhoneNumber } from '../utils';
import config from '../config';

type SectionProps = {
  title: string;
  text: string;
  link: string;
  icon: JSX.Element;
};

const Section: React.FunctionComponent<SectionProps> = ({ title, text, icon, link }) => (
  <div className="flex items-top mb-10">
    <div className="mr-3">{icon}</div>
    <div className="flex flex-wrap">
      <div className="w-full pb-2">
        <Text className="uppercase">{title}</Text>
      </div>
      <div className="w-full">
        <a href={link} target="_blank" rel="noreferrer">
          <Text color="text-black" weight="font-bold">
            {text}
          </Text>
        </a>
      </div>
    </div>
  </div>
);

const ContactPage: React.FunctionComponent = () => {
  const {
    phoneNumber,
    email,
    socialMedia: { instagram, youtube },
  } = config;
  const red = config.colors['red-100'];
  const title = 'Contact';

  const sections: SectionProps[] = [
    {
      title: 'Phone',
      text: formatPhoneNumber(phoneNumber),
      link: `tel:${phoneNumber}`,
      icon: <PhoneIcon />,
    },
    {
      title: 'Email',
      text: email,
      link: `mailto:${email}`,
      icon: <EmailIcon />,
    },
    {
      title: 'Instagram',
      text: `@${instagram.split('/').pop()}`,
      link: instagram,
      icon: <SocialIcon bgColor={red} style={{ height: '20px', width: '20px' }} network="instagram" />,
    },
    {
      title: 'Youtube',
      text: `Standout Specialties`,
      link: youtube,
      icon: <SocialIcon bgColor={red} style={{ height: '20px', width: '20px' }} network="youtube" />,
    },
  ];

  return (
    <Layout
      seoProps={{
        title,
        openGraph: {
          url: constructCanonicalUrl({ page: 'contact' }),
          title,
          description: 'Get in contact with us',
        },
      }}
      headerTitle={title}
      containerClassName="flex-wrap"
      containerPadding="py-10"
    >
      <div className="w-full md:w-1/2">
        {sections.map((props) => (
          <Section key={props.title} {...props} />
        ))}
      </div>
      <div className="w-full md:w-1/2 bg-black p-5">
        <ContactForm />
      </div>
    </Layout>
  );
};

export default ContactPage;
