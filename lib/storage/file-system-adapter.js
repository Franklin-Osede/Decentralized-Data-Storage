const fs = require('fs').promises;
const path = require('path');
const StorageInterface = require('./storage-interface');
const { ShardNotFoundError } = require('./errors');
const createLogger = require('./logger');

/**
 * Storage adapter that uses the file system to store shards
 * Implements the StorageInterface
 */
class FileSystemStorageAdapter extends StorageInterface {
  /**
   * @param {Object} options Storage adapter options
   * @param {string} options.storagePath Base directory for storing shards
   * @param {string} [options.logLevel='info'] Logging level
   */
  constructor(options) {
    super();
    if (!options?.storagePath) {
      throw new Error('Storage path is required');
    }

    this.storagePath = options.storagePath;
    this.logger = createLogger(options.logLevel);
    this.MAX_SHARD_SIZE = 500 * 1024 * 1024; // 500MB - Limit to prevent oversized shards
  }

  /**
   * Ensures the storage directory exists
   * @private
   */
  async _ensureDirectory() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates a shard hash
   * @private
   * @param {string} hash - Hash to validate
   * @throws {Error} If hash is invalid
   */
  _validateHash(hash) {
    if (!hash || typeof hash !== 'string' || hash.length === 0) {
      throw new Error('Invalid hash');
    }
  }

  /**
   * Stores a shard in the filesystem
   */
  async put(hash, data) {
    this._validateHash(hash);
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    if (data.length > this.MAX_SHARD_SIZE) {
      throw new Error(`Shard size exceeds the limit of ${this.MAX_SHARD_SIZE / (1024 * 1024)}MB`);
    }

    const filePath = path.join(this.storagePath, hash);

    try {
      await this._ensureDirectory();
      await fs.writeFile(filePath, data);
      this.logger.info(`Stored shard ${hash} (${data.length} bytes)`);
      return hash;
    } catch (error) {
      this.logger.error(`Failed to store shard ${hash}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves a shard from the filesystem
   */
  async get(hash) {
    this._validateHash(hash);
    const filePath = path.join(this.storagePath, hash);

    try {
      await fs.access(filePath); // Check if the file exists before reading
      const data = await fs.readFile(filePath);
      this.logger.debug(`Retrieved shard ${hash} (${data.length} bytes)`);
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Shard not found: ${hash}`);
        throw new ShardNotFoundError(hash);
      }
      this.logger.error(`Error retrieving shard ${hash}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a shard from the filesystem
   */
  async delete(hash) {
    this._validateHash(hash);
    const filePath = path.join(this.storagePath, hash);

    try {
      await fs.unlink(filePath);
      this.logger.info(`Deleted shard ${hash}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Shard ${hash} not found for deletion.`);
      } else {
        this.logger.error(`Failed to delete shard ${hash}: ${error.message}`);
        throw new Error(`Failed to delete shard: ${hash}`);
      }
    }
  }

  /**
   * Lists all stored shards
   */
  async list() {
    try {
      await this._ensureDirectory();
      const files = await fs.readdir(this.storagePath);
      this.logger.debug(`Listed ${files.length} shards`);
      return files;
    } catch (error) {
      this.logger.error(`Failed to list shards: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets storage statistics
   */
  async getStats() {
    try {
      const files = await this.list();
      const statsArray = await Promise.all(
        files.map(file => fs.stat(path.join(this.storagePath, file)))
      );

      const totalSize = statsArray.reduce((sum, stats) => sum + stats.size, 0);

      const stats = {
        totalShards: files.length,
        totalSize,
        averageSize: files.length ? Math.round(totalSize / files.length) : 0
      };

      this.logger.info(`Storage stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FileSystemStorageAdapter;
