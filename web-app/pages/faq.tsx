import React from 'react';
import { GetServerSideProps } from 'next';
import Text from '../components/Text';
import Layout from '../components/Layout';
import { constructCanonicalUrl } from '../utils';
import WordPressClient from '../utils/clients/wordpress';

type Props = {
    faqs: WordPress.FAQ[];
};

const FrequentlyAskedQuestionsPage: React.FunctionComponent<Props> = ({ faqs }) => {
    const title = 'Frequently Asked Questions';

    return (
        <Layout
            seoProps={{
                title,
                openGraph: {
                    url: constructCanonicalUrl({ page: 'faq' }),
                    title,
                    description: 'Check out responses to some of our most frequently asked questions',
                },
            }}
            containerItemsPosition="items-stretch"
            containerClassName="flex-col"
            headerTitle={title}
        >
            {faqs.map(({ question, answer }, idx) => (
                <div key={idx} className="mb-5">
                    <Text color="text-black" weight="font-bold" size="text-lg" className="uppercase mb-2">
                        {question}
                    </Text>
                    <div
                        className="font-primary text-gray-100 text-base font-normal"
                        dangerouslySetInnerHTML={{ __html: answer }}
                    />
                </div>
            ))}
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const faqs = await WordPressClient.getFaqs();
    return {
        props: {
            faqs,
        },
    };
};

export default FrequentlyAskedQuestionsPage;
