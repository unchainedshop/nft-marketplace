export default (article, key, { locale = "DES", multi = false } = false) => {
  const valueObject = article[key] || [];
  if (Array.isArray(valueObject)) {
    const localizedValues = valueObject.map((item) => item[locale]);
    if (multi) return localizedValues;
    return localizedValues.find(Boolean);
  }
  return valueObject[locale];
};
