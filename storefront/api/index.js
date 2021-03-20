import { ApolloServer } from 'apollo-server-micro';
import responseCachePlugin from 'apollo-server-plugin-response-cache';

import mergedSchema from './mergedSchema';
import mapForwardHeaders from './mapForwardHeaders';

const createApolloServer = async () => {
  return new ApolloServer({
    schema: await mergedSchema(),
    introspection: true,
    cors: false,
    cacheControl: true,
    tracing: false,
    context: (graphqlContext) => {
      return {
        ...graphqlContext,
        forwardHeaders: mapForwardHeaders(graphqlContext.req),
      };
    },
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    plugins: [
      responseCachePlugin({
        extraCacheKeyData: ({ context }) => {
          return context?.locale?.normalized || '';
        },
        shouldReadFromCache: ({ req }) => {
          const bustCache = req?.query?.bustCache;
          return !bustCache;
        },
        shouldWriteToCache: ({ req }) => {
          const bustCache = req?.query?.bustCache;
          return !bustCache;
        },
      }),
    ],
  });
};

const apolloServerPromise = createApolloServer();

export default async (...args) => {
  const apolloServer = await apolloServerPromise;
  return apolloServer.createHandler({ path: '/api/graphql' })(...args);
};
