/**
 * NMK Developer DMOJ-based Extra Configs - Per-Site Storage Adapter
 * Provides isolated storage for each DMOJ domain using chrome.storage.local.
 * Maintains an in-memory cache for synchronous, zero-latency reads.
 */

const PREFIX = 'nmkdeveloperdmojbasedextraconfigs_';

const SiteStore = {
  _hostname: '',
  _cache: {},
  _initialized: false,

  _getSiteKey(k, host = this._hostname) {
    return `${PREFIX}${host}_${k}`;
  },

  _getGlobalKey(k) {
    return `${PREFIX}global_${k}`;
  },

  async init(customHost) {
    this._hostname = customHost || (typeof location !== 'undefined' ? location.hostname : 'localhost');
    this._cache = {};

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const allData = await chrome.storage.local.get(null);
        const sitePrefix = `${PREFIX}${this._hostname}_`;
        const globalPrefix = `${PREFIX}global_`;

        for (const [key, value] of Object.entries(allData)) {
          if (key.startsWith(sitePrefix)) {
            const shortKey = key.slice(sitePrefix.length);
            this._cache[shortKey] = value;
          } else if (key.startsWith(globalPrefix)) {
            const shortKey = `global_${key.slice(globalPrefix.length)}`;
            this._cache[shortKey] = value;
          }
        }
      } catch (e) {
        console.warn('[SiteStore] Failed to load from chrome.storage.local:', e);
      }
    }
    this._initialized = true;
    return this;
  },

  get(key, defaultValue = null) {
    if (key in this._cache) {
      return this._cache[key];
    }
    return defaultValue;
  },

  async set(key, value) {
    this._cache[key] = value;
    const fullKey = this._getSiteKey(key);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [fullKey]: value });
        return true;
      } catch (e) {
        console.error('[SiteStore] Error writing key', fullKey, e);
        return false;
      }
    }
    return true;
  },

  async del(key) {
    delete this._cache[key];
    const fullKey = this._getSiteKey(key);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.remove(fullKey);
        return true;
      } catch (e) {
        console.error('[SiteStore] Error deleting key', fullKey, e);
        return false;
      }
    }
    return true;
  },

  async getGlobal(key, defaultValue = null) {
    const globalKey = `global_${key}`;
    if (globalKey in this._cache) {
      return this._cache[globalKey];
    }
    const fullKey = this._getGlobalKey(key);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await chrome.storage.local.get(fullKey);
        const val = data[fullKey] !== undefined ? data[fullKey] : defaultValue;
        this._cache[globalKey] = val;
        return val;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  },

  async setGlobal(key, value) {
    const globalKey = `global_${key}`;
    this._cache[globalKey] = value;
    const fullKey = this._getGlobalKey(key);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({ [fullKey]: value });
        return true;
      } catch (e) {
        console.error('[SiteStore] Error writing global key', fullKey, e);
        return false;
      }
    }
    return true;
  },

  async delGlobal(key) {
    const globalKey = `global_${key}`;
    delete this._cache[globalKey];
    const fullKey = this._getGlobalKey(key);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.remove(fullKey);
        return true;
      } catch (e) {
        console.error('[SiteStore] Error deleting global key', fullKey, e);
        return false;
      }
    }
    return true;
  }
};

if (typeof window !== 'undefined') {
  window.SiteStore = SiteStore;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SiteStore };
}
