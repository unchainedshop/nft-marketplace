import getConfig from 'next/config';
import buildUnchainedSchema from './unchained';

const {
  publicRuntimeConfig: { NODE_ENV, SKIP_INVALID_REMOTES },
} = getConfig();

export default async () => {
  // eslint-disable-next-line no-undef
  const [unchainedSchema] = await Promise.all([buildUnchainedSchema()]);

  return unchainedSchema;
};

