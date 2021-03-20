import sanitizeIntegerValues from "./sanitizeIntegerValues.js";
import removeDuplicates from "./removeDuplicates.js";

const sanitizeAttributes = (rawAttributes, locale = "de") => {
  return Object.fromEntries(
    Object.entries(rawAttributes)
      .map(([key, values]) => {
        if (!values.filter) {
          console.warn("TODO", values);
          return null;
        }
        const sanitizedValues = sanitizeIntegerValues(
          removeDuplicates(values, locale)
        ).filter((item) => {
          return !(
            Object.entries(item).length === 0 && item.constructor === Object
          );
        });
        if (!sanitizedValues) {
          return null;
        }
        return [key, sanitizedValues];
      })
      .filter(Boolean)
  );
};

const markProxyAttributes = (attributes, proxyAttributes) => {
  return Object.fromEntries(
    Object.entries(attributes || {}).map(([attributeKey, values]) => {
      const isProxy = !!proxyAttributes?.[attributeKey];
      return [
        attributeKey,
        values.map((value) => {
          if (!value) return value;
          return { ...value, isProxy };
        }),
      ];
    })
  );
};

export default (myAttributes, proxyAttributes) => {
  return markProxyAttributes(sanitizeAttributes(myAttributes), proxyAttributes);
};
