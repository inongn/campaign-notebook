// shared.js

/**
 * Retrieve data from localStorage by key.
 * @param {string} key - The key to retrieve data for.
 * @returns {any} The parsed data from localStorage, or null if no data is found.
 */
function loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading data from localStorage with key "${key}":`, error);
      return null;
    }
  }
  
  /**
   * Save data to localStorage under the specified key.
   * @param {string} key - The key to save data under.
   * @param {any} data - The data to save (will be stringified).
   */
  function saveToLocalStorage(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Error saving data to localStorage with key "${key}":`, error);
    }
  }
  
  /**
   * Generate a unique identifier (UUID v4).
   * @returns {string} A unique identifier string.
   */
  function generateUUID() {
    // Generates a random UUID (v4 compliant)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  