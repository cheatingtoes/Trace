const cleanEmptyStrings = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // If value is an empty string, use null
    // Otherwise use the original value
    acc[key] = value === '' ? null : value;
    return acc;
  }, {});
};

module.exports = { cleanEmptyStrings };