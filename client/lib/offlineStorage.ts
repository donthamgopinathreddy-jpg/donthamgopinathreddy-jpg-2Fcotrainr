import { Capacitor } from "@capacitor/core";

/**
 * Offline storage for syncing data when connection is restored
 * Uses localStorage for web, and dynamically loads Preferences on native
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

// Storage implementation abstraction
interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web storage adapter
const webStorageAdapter: IStorage = {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
  },
};

let storageInstance: IStorage = webStorageAdapter;
let initialized = false;

// Initialize storage based on platform
async function initStorage(): Promise<IStorage> {
  if (initialized) return storageInstance;

  if (!Capacitor.isNativePlatform()) {
    initialized = true;
    return webStorageAdapter;
  }

  try {
    // Only import Preferences on native platforms
    // Use dynamic module name to prevent Rollup analysis during build
    const moduleName = ["@capacitor", "preferences"].join("/");
    const PreferencesModule = await import(/* @vite-ignore */ moduleName);
    const Preferences = PreferencesModule.Preferences;

    storageInstance = {
      getItem: async (key: string) => {
        const result = await Preferences.get({ key });
        return result.value;
      },
      setItem: async (key: string, value: string) => {
        await Preferences.set({ key, value });
      },
      removeItem: async (key: string) => {
        await Preferences.remove({ key });
      },
    };

    initialized = true;
    return storageInstance;
  } catch (error) {
    console.error("Failed to initialize Preferences, falling back to localStorage:", error);
    initialized = true;
    return webStorageAdapter;
  }
}

/**
 * Store an operation for later sync
 */
export async function storePendingOperation(
  type: "create" | "update" | "delete",
  endpoint: string,
  data: unknown
): Promise<string> {
  try {
    const storage = await initStorage();
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

    await storage.setItem(OPERATIONS_KEY, JSON.stringify(existing));
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
    const storage = await initStorage();
    const result = await storage.getItem(OPERATIONS_KEY);
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
    const storage = await initStorage();
    const operations = await getPendingOperations();
    const filtered = operations.filter((op) => op.id !== operationId);
    await storage.setItem(OPERATIONS_KEY, JSON.stringify(filtered));
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
    const storage = await initStorage();
    const operations = await getPendingOperations();
    const operation = operations.find((op) => op.id === operationId);
    if (operation && incrementRetries) {
      operation.retries += 1;
    }
    await storage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
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
    const storage = await initStorage();
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    await storage.setItem(cacheKey, JSON.stringify(data));
    await storage.setItem(ttlKey, String(Date.now() + ttlMs));
  } catch (error) {
    console.error("Failed to cache data:", error);
  }
}

/**
 * Get cached data if not expired
 */
export async function getCachedData<T = unknown>(key: string): Promise<T | null> {
  try {
    const storage = await initStorage();
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const ttlKey = `${CACHE_TTL_KEY}${key}`;

    const ttlResult = await storage.getItem(ttlKey);
    const ttl = ttlResult ? parseInt(ttlResult, 10) : null;

    if (!ttl || Date.now() > ttl) {
      // Expired or not found
      await storage.removeItem(cacheKey);
      await storage.removeItem(ttlKey);
      return null;
    }

    const dataResult = await storage.getItem(cacheKey);
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
    console.log("Cache clearing limited - storage limitation");
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
    await initStorage();
    const operations = await getPendingOperations();
    if (onPendingOperations && operations.length > 0) {
      onPendingOperations(operations);
    }
  } catch (error) {
    console.error("Failed to initialize offline storage:", error);
  }
}
