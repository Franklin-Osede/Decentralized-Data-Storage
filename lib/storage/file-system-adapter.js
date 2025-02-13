const fs = require('fs').promises;
const path = require('path');
const StorageInterface = require('./storage-interface');
const { ShardNotFoundError } = require('./errors');

/**
 * Storage adapter that uses the file system to store shards
 * @implements {StorageInterface}
 */
class FileSystemStorageAdapter extends StorageInterface {
  /**
   * @param {string} storagePath - Base directory for storing shards
   * @throws {Error} If storage path is not provided
   */
  constructor(storagePath) {
    super();
    if (!storagePath) {
      throw new Error('Storage path is required');
    }
    this.storagePath = storagePath;
  }

  /**
   * Ensures the storage directory exists
   * @private
   */
  async _ensureDirectory() {
    await fs.mkdir(this.storagePath, { recursive: true });
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
   * @inheritdoc
   */
  async put(hash, data) {
    this._validateHash(hash);
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    await this._ensureDirectory();
    const filePath = path.join(this.storagePath, hash);
    await fs.writeFile(filePath, data);
    return hash;
  }

  /**
   * @inheritdoc
   */
  async get(hash) {
    this._validateHash(hash);
    const filePath = path.join(this.storagePath, hash);

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new ShardNotFoundError(hash);
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  async delete(hash) {
    this._validateHash(hash);
    const filePath = path.join(this.storagePath, hash);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * @inheritdoc
   */
  async list() {
    await this._ensureDirectory();
    return await fs.readdir(this.storagePath);
  }
}

module.exports = FileSystemStorageAdapter;