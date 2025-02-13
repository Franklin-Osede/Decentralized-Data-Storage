/**
 * Custom error for storage-related operations
 * @extends Error
 */
class StorageError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message, code) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

/**
 * Error thrown when a shard is not found
 */
class ShardNotFoundError extends StorageError {
  /**
   * @param {string} hash - Hash of the shard that wasn't found
   */
  constructor(hash) {
    super(`Shard not found: ${hash}`, 'SHARD_NOT_FOUND');
  }
}

module.exports = {
  StorageError,
  ShardNotFoundError
};