export default (array, key) => {
  return array.filter(
    (obj, index, self) => index === self.findIndex((el) => el[key] === obj[key])
  );
};
