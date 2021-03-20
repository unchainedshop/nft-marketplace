export default (op, fn, options) => async (data, moreOptions) => {
  const result = await fn(data, { ...options, ...moreOptions });
  if (!result?.length) return;
  return result.map((doc) => op.insert(doc));
};
