/* eslint-disable no-undef */

console.log(process.version);

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-extended').load({
  silent: process.env.SUPPRESS_ENV_ERRORS,
  errorOnMissing: !process.env.SUPPRESS_ENV_ERRORS,
  errorOnRegex: !process.env.SUPPRESS_ENV_ERRORS,
  errorOnExtra: !process.env.SUPPRESS_ENV_ERRORS,
  includeProcessEnv: true,
});

const {
  FRONTEND_URL,
  GRAPHQL_ENDPOINT,
  NODE_ENV,
  SKIP_INVALID_REMOTES,
  UNCHAINED_ENDPOINT,
} = process.env;

module.exports = {
  serverRuntimeConfig: {
  },
  publicRuntimeConfig: {
    FRONTEND_URL,
    GRAPHQL_ENDPOINT,
    NODE_ENV,
    SKIP_INVALID_REMOTES: JSON.parse(SKIP_INVALID_REMOTES || 'false'),
    UNCHAINED_ENDPOINT,
  },
};
