import React from 'react';
import App from 'next/app';

import '../public/static/css/all.css';
import withApollo from '../modules/apollo/utils/withApollo';
import { AppContextWrapper } from '../modules/ethereum/AppContextWrapper';

const UnchainedApp = ({ Component, pageProps }) => {
  return (
    <AppContextWrapper>
      <Component {...pageProps} />
    </AppContextWrapper>
  );
};

UnchainedApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default withApollo(UnchainedApp);
