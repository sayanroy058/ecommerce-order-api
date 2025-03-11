/**
 * Simple in-memory cache utility
 */
class Cache {
    constructor() {
      this.cache = new Map();
      this.ttls = new Map();
    }
    
    /**
     * Get an item from the cache
     * @param {string} key - Cache key
     * @returns {*} - Cached value or undefined
     */
    get(key) {
      // Check if key exists and hasn't expired
      if (this.cache.has(key) && this.ttls.get(key) > Date.now()) {
        return this.cache.get(key);
      }
      
      // Key doesn't exist or has expired - clean up
      if (this.cache.has(key)) {
        this.del(key);
      }
      
      return undefined;
    }
    
    /**
     * Set an item in the cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttlSeconds - TTL in seconds
     */
    set(key, value, ttlSeconds = 3600) {
      this.cache.set(key, value);
      this.ttls.set(key, Date.now() + (ttlSeconds * 1000));
    }
    
    /**
     * Delete an item from the cache
     * @param {string} key - Cache key
     */
    del(key) {
      this.cache.delete(key);
      this.ttls.delete(key);
    }
    
    /**
     * Clear all expired items
     */
    cleanup() {
      const now = Date.now();
      for (const [key, expiry] of this.ttls.entries()) {
        if (expiry <= now) {
          this.del(key);
        }
      }
    }
  }
  
  // Create a singleton instance
  const cache = new Cache();
  
  // Run cleanup every 10 minutes
  setInterval(() => cache.cleanup(), 10 * 60 * 1000);
  
  module.exports = cache;