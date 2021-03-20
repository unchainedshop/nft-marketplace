/* eslint-disable no-undef */
import { mergeSchemas, addSchemaLevelResolveFunction } from 'graphql-tools';
import getConfig from 'next/config';

import getSchemas from './remotes';

const {
  publicRuntimeConfig: { NODE_ENV },
} = getConfig();

const namedQueryCacheMap = {
  // Unchained
  assortmentTree: { maxAge: 60 * 60, scope: 'PUBLIC' },
  assortmentPaths: { maxAge: 60 * 60, scope: 'PUBLIC' },
  assortmentChildren: { maxAge: 60 * 60, scope: 'PUBLIC' },
};

const addCacheHintToQueryOrType = (
  parent,
  args,
  context,
  { cacheControl, operation, ...info },
) => {
  const cacheHint = namedQueryCacheMap?.[operation?.name?.value];
  if (cacheHint) {
    cacheControl.setCacheHint(cacheHint);
  } else if (NODE_ENV !== 'production') {
    // eslint-disable-next-line
    console.warn(
      `Could not find cache configuration for ${operation?.name?.value} (${info.fieldName})`,
    );
  }
};

// eslint-disable-next-line
export default async () => {
  try {
    const schemas = await getSchemas();

    const mergedSchema = mergeSchemas({
      schemas,
    });

    const typeMap = mergedSchema.getTypeMap();
    Object.keys(typeMap).forEach((typeName) => {
      const type = mergedSchema.getType(typeName);
      if (type.getFields) {
        const fields = type.getFields();
        Object.keys(fields).forEach((fieldName) => {
          if (
            fields[fieldName]?.resolve &&
            fields[fieldName]?.resolve instanceof Function &&
            fields[fieldName]?.astNode?.kind === 'FieldDefinition'
          ) {
            const originalResolveFn = fields[fieldName].resolve;
            fields[fieldName].resolve = (...rest) => {
              addCacheHintToQueryOrType(...rest);
              return originalResolveFn(...rest);
            };
          }
        });
      }
    });
    addSchemaLevelResolveFunction(mergedSchema, addCacheHintToQueryOrType);

    return mergedSchema;
  } catch (e) {
    console.error(
      'Could not load all schemas, abort here so the docker container restarts...',
      e,
    );
    process.exit(500);
  }
};
