/**
 * Offline storage for syncing data when connection is restored
 * Uses localStorage (available on web and Capacitor WebView)
 */

interface StoredOperation {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

const OPERATIONS_KEY = "pending_operations";
const CACHE_PREFIX = "cache_";
const CACHE_TTL_KEY = "cache_ttl_";

/**
 * Store an operation for later sync
 */
export async function storePendingOperation(
  type: "create" | "update" | "delete",
  endpoint: string,
  data: unknown
): Promise<string> {
  try {
    const operationId = `${Date.now()}_${Math.random()}`;
    const operation: StoredOperation = {
      id: operationId,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    const existing = await getPendingOperations();
    existing.push(operation);

    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(existing));
    return operationId;
  } catch (error) {
    console.error("Failed to store pending operation:", error);
    throw error;
  }
}

/**
 * Get all pending operations
 */
export async function getPendingOperations(): Promise<StoredOperation[]> {
  try {
    const result = localStorage.getItem(OPERATIONS_KEY);
    return result ? JSON.parse(result) : [];
  } catch (error) {
    console.error("Failed to get pending operations:", error);
    return [];
  }
}

/**
 * Remove a pending operation
 */
export async function removePendingOperation(operationId: string): Promise<void> {
  try {
    const operations = await getPendingOperations();
    const filtered = operations.filter((op) => op.id !== operationId);
    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove pending operation:", error);
  }
}

/**
 * Update operation retry count
 */
export async function updateOperationRetry(
  operationId: string,
  incrementRetries: boolean = true
): Promise<void> {
  try {
    const operations = await getPendingOperations();
    const operation = operations.find((op) => op.id === operationId);
    if (operation && incrementRetries) {
      operation.retries += 1;
    }
    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
  } catch (error) {
    console.error("Failed to update operation retry:", error);
  }
}

/**
 * Cache data with TTL
 */
export async function cacheData(
  key: string,
  data: unknown,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(ttlKey, String(Date.now() + ttlMs));
  } catch (error) {
    console.error("Failed to cache data:", error);
  }
}

/**
 * Get cached data if not expired
 */
export async function getCachedData<T = unknown>(key: string): Promise<T | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    const ttl = localStorage.getItem(ttlKey);
    if (!ttl || Date.now() > parseInt(ttl, 10)) {
      // Expired or not found
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(ttlKey);
      return null;
    }

    const dataResult = localStorage.getItem(cacheKey);
    return dataResult ? JSON.parse(dataResult) : null;
  } catch (error) {
    console.error("Failed to get cached data:", error);
    return null;
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  try {
    // Clear all cache-prefixed items
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TTL_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

/**
 * Initialize offline storage listener
 */
export async function initializeOfflineStorage(
  onPendingOperations?: (operations: StoredOperation[]) => void
): Promise<void> {
  try {
    const operations = await getPendingOperations();
    if (onPendingOperations && operations.length > 0) {
      onPendingOperations(operations);
    }
  } catch (error) {
    console.error("Failed to initialize offline storage:", error);
  }
}
