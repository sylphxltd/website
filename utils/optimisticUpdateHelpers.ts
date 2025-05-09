/**
 * Generates a temporary client-side ID.
 * @param prefix Optional prefix for the ID. Defaults to 'temp'.
 * @returns A string representing the temporary ID, e.g., "temp-1678886400000".
 */
export function generateTempId(prefix = 'temp') {
  return `${prefix}-${Date.now()}`;
}

/**
 * Creates a deep clone of a JSON-safe object.
 * Note: This method uses JSON.parse(JSON.stringify(obj)), which works well for most
 * plain data objects but has limitations with complex types like Date objects (converted to strings),
 * functions, undefined, Map, Set, etc. (which are lost or converted).
 * For the current optimistic update use cases involving store state, this is generally sufficient.
 * @param object The object to clone.
 * @returns A deep clone of the object.
 */
export function deepClone<T>(object: T): T {
  if (object === null || typeof object !== 'object') {
    return object; // Not an object, or null, return as is
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    console.error("deepClone error: Object might not be JSON-safe.", e, object);
    // Fallback or rethrow depending on desired strictness.
    // For optimistic updates, if cloning fails, it's a significant issue.
    throw new Error("Failed to deep clone object. Ensure it is JSON-safe.");
  }
}

/**
 * Gets the current timestamp in ISO string format.
 * @returns The current ISO timestamp string.
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

// It might also be useful to have helpers for array manipulations if they become complex,
// but findIndex, filter, and splice are quite standard.
// For now, the above three cover the most common repeated logic.