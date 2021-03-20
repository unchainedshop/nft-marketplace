import React from 'react';
import App from 'next/app';

import '../public/static/css/all.css';
import withApollo from '../modules/apollo/utils/withApollo';

const UnchainedApp = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

UnchainedApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default withApollo(UnchainedApp);
