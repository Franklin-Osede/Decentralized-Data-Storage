/**
 * Interface that defines the contract for storage adapters
 * @interface
 */
class StorageInterface {
  /**
   * Store a shard
   * @param {string} hash - The hash identifier of the shard
   * @param {Buffer} data - The data to store
   * @returns {Promise<string>} The hash of stored data
   */
  async put(hash, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Retrieve a shard
   * @param {string} hash - The hash identifier of the shard
   * @returns {Promise<Buffer>} The retrieved data
   */
  async get(hash) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a shard
   * @param {string} hash - The hash identifier of the shard
   * @returns {Promise<void>}
   */
  async delete(hash) {
    throw new Error('Method not implemented');
  }

  /**
   * List all stored shards
   * @returns {Promise<string[]>} Array of shard hashes
   */
  async list() {
    throw new Error('Method not implemented');
  }
}

module.exports = StorageInterface;