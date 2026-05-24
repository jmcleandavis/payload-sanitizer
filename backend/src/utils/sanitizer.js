/**
 * Helper to check if a value is a plain JavaScript object (literal dictionary block).
 */
const isPlainObject = (val) => {
  return val !== null && typeof val === 'object' && val.constructor === Object;
};

/**
 * Helper to recursively flatten a plain object.
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  return flattened;
}

/**
 * Recursively strips null values, undefined values, and empty strings from an object or array.
 * Flattens nested structures if specified to prevent automation tool nesting failures.
 */
export function sanitizePayload(input, flatten = false, options = {}) {
  // Support both (input, flatten, options) and (input, options) signatures
  let shouldFlatten = false;
  let preserveArrayNulls = false;

  if (typeof flatten === 'boolean') {
    shouldFlatten = flatten;
    preserveArrayNulls = options?.preserveArrayNulls === true;
  } else if (flatten && typeof flatten === 'object') {
    shouldFlatten = flatten.flatten === true;
    preserveArrayNulls = flatten.preserveArrayNulls === true;
    options = flatten;
  }

  // Handle primitives and non-plain objects (like Date, RegExp)
  if (!isPlainObject(input) && !Array.isArray(input)) {
    return input;
  }

  if (Array.isArray(input)) {
    const mapped = input.map(item => sanitizePayload(item, shouldFlatten, options));
    if (preserveArrayNulls) {
      // Map empty elements (null, undefined, '') to null to preserve array index alignments
      return mapped.map(item => (item === null || item === undefined || item === '') ? null : item);
    } else {
      return mapped.filter(item => item !== null && item !== undefined && item !== '');
    }
  }

  // Handle plain objects
  const cleaned = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === '') {
      continue; // Skip keys with empty values
    }

    const processedValue = sanitizePayload(value, shouldFlatten, options);

    // Skip empty nested objects if they were completely stripped, unless they are non-plain objects
    if (isPlainObject(processedValue) && Object.keys(processedValue).length === 0) {
      continue;
    }

    cleaned[key] = processedValue;
  }

  // Flatten the final cleaned object if flattening is enabled at this level
  if (shouldFlatten) {
    return flattenObject(cleaned);
  }

  return cleaned;
}

