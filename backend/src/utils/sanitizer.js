/**
 * Recursively strips null values, undefined values, and empty strings from an object.
 * Flattens nested structures if specified to prevent automation tool nesting failures.
 */
export function sanitizePayload(input, flatten = false) {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  if (Array.isArray(input)) {
    return input
      .map(item => sanitizePayload(item, flatten))
      .filter(item => item !== null && item !== undefined && item !== '');
  }

  const cleaned = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === '') {
      continue; // Skip keys with empty values
    }

    const processedValue = sanitizePayload(value, flatten);

    if (flatten && typeof processedValue === 'object' && !Array.isArray(processedValue) && processedValue !== null) {
      // Flatten nested properties into parent level using dot notation or underscore separator
      for (const [nestedKey, nestedValue] of Object.entries(processedValue)) {
        cleaned[`${key}_${nestedKey}`] = nestedValue;
      }
    } else {
      cleaned[key] = processedValue;
    }
  }

  return cleaned;
}
