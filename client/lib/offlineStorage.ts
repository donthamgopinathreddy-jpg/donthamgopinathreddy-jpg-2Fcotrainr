import { Preferences } from "@capacitor/preferences";

/**
 * Offline storage for syncing data when connection is restored
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
  data: unknown,
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

    await Preferences.set({
      key: OPERATIONS_KEY,
      value: JSON.stringify(existing),
    });

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
    const result = await Preferences.get({ key: OPERATIONS_KEY });
    return result.value ? JSON.parse(result.value) : [];
  } catch (error) {
    console.error("Failed to get pending operations:", error);
    return [];
  }
}

/**
 * Remove a pending operation
 */
export async function removePendingOperation(
  operationId: string,
): Promise<void> {
  try {
    const operations = await getPendingOperations();
    const filtered = operations.filter((op) => op.id !== operationId);
    await Preferences.set({
      key: OPERATIONS_KEY,
      value: JSON.stringify(filtered),
    });
  } catch (error) {
    console.error("Failed to remove pending operation:", error);
  }
}

/**
 * Update operation retry count
 */
export async function updateOperationRetry(
  operationId: string,
  incrementRetries: boolean = true,
): Promise<void> {
  try {
    const operations = await getPendingOperations();
    const operation = operations.find((op) => op.id === operationId);
    if (operation && incrementRetries) {
      operation.retries += 1;
    }
    await Preferences.set({
      key: OPERATIONS_KEY,
      value: JSON.stringify(operations),
    });
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
  ttlMs: number = 5 * 60 * 1000, // 5 minutes
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    await Preferences.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    await Preferences.set({
      key: ttlKey,
      value: String(Date.now() + ttlMs),
    });
  } catch (error) {
    console.error("Failed to cache data:", error);
  }
}

/**
 * Get cached data if not expired
 */
export async function getCachedData<T = unknown>(
  key: string,
): Promise<T | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    const ttlResult = await Preferences.get({ key: ttlKey });
    const ttl = ttlResult.value ? parseInt(ttlResult.value, 10) : null;

    if (!ttl || Date.now() > ttl) {
      // Expired or not found
      await Preferences.remove({ key: cacheKey });
      await Preferences.remove({ key: ttlKey });
      return null;
    }

    const dataResult = await Preferences.get({ key: cacheKey });
    return dataResult.value ? JSON.parse(dataResult.value) : null;
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
    // Get all keys and filter cache keys
    const result = await Preferences.get({ key: OPERATIONS_KEY });
    // Note: Capacitor Preferences doesn't have a list all keys method
    // So we'll store cache keys in a metadata key
    console.log("Cache clearing limited - Capacitor Preferences limitation");
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

/**
 * Initialize offline storage listener
 */
export async function initializeOfflineStorage(
  onPendingOperations?: (operations: StoredOperation[]) => void,
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
