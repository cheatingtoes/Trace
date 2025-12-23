// trace-backend/utils/db-converters.js

// 1. Helper to safely check if something is a Plain Object
// This prevents crashing on 'undefined', 'null', or native types like Dates/Buffers
const isPlainObject = (obj) => {
  return obj !== null && typeof obj === 'object' && obj.constructor === Object;
};

const toCamel = (s) => {
  return s.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const toSnake = (s) => {
  return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const mapKeys = (obj, mapper) => {
  // A. Handle Arrays (iterate over them)
  if (Array.isArray(obj)) {
    return obj.map(v => mapKeys(v, mapper));
  } 
  
  // B. Handle Objects (transform keys)
  // We use our safe helper here to avoid the crash
  if (isPlainObject(obj)) {
    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];
      // Recursive call for nested objects
      result[mapper(key)] = mapKeys(value, mapper);
      return result;
    }, {});
  }
  
  // C. Handle everything else (Strings, Numbers, Dates, null, undefined)
  // Just return them as-is
  return obj;
};

module.exports = {
  postProcessResponse: (result) => {
    // Safety check: if result is undefined/null, return it immediately
    if (!result) return result;
    return mapKeys(result, toCamel);
  },

  wrapIdentifier: (value, origImpl, queryContext) => {
    if (value === '*') return origImpl(value);
    return origImpl(toSnake(value));
  }
};