const isInteger = (str) => parseInt(str, 10) === Number(str);
const formatIntegerLikeString = (s) =>
  isInteger(s) ? Number(s).toFixed(1) : s;

// FIXME: while js guarantee key order, that is only true for string keys
// integer keys are sorted BEFORE the other keys, so we have to remove these integer keys by writing them as a string (x.0)
// see https://exploringjs.com/es6/ch_oop-besides-classes.html#_integer-indices
// Problem is now, that attributes are written into an object and then sorted later in sortOptionObjectByGermanTitle

const sanitizeIntegerValues = (values) =>
  values.map((v) =>
    Object.fromEntries(
      Object.entries(v).map(([key, value]) => [
        key,
        formatIntegerLikeString(value),
      ])
    )
  );

export default sanitizeIntegerValues;
