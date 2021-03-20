import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import fetch from 'isomorphic-unfetch';
import getConfig from 'next/config';

import possibleTypes from '../../../possibleTypes.json';

const {
  publicRuntimeConfig: { GRAPHQL_ENDPOINT },
} = getConfig();

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  (global as any).fetch = fetch;
}

function create(initialState) {
  const httpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'same-origin',
  });

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: httpLink,
    cache: new InMemoryCache({ possibleTypes }).restore(initialState || {}),
  });
}

export default function initApollo({ initialState }) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
