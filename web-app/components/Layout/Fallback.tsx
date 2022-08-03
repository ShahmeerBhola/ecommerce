import React from 'react';
import Layout from './Layout';
import BarLoader from '../Loading';

const PageFallback: React.FunctionComponent = () => (
    <Layout seoProps={{ title: 'Loading' }} containerClassName="justify-center">
        <BarLoader />
    </Layout>
);

export default PageFallback;
