const fs = require('fs').promises;
const path = require('path');
const sinon = require('sinon');
const { expect } = require('chai');
const FileSystemStorageAdapter = require('../file-system-storage-adapter');
const { ShardNotFoundError } = require('../errors');

describe('FileSystemStorageAdapter', function () {
  const storagePath = path.join(__dirname, 'test-storage');
  let storage;

  beforeEach(async function () {
    storage = new FileSystemStorageAdapter({ storagePath, logLevel: 'error' });
    await fs.mkdir(storagePath, { recursive: true }); // Ensure directory exists
  });

  afterEach(async function () {
    await fs.rmdir(storagePath, { recursive: true }).catch(() => { }); // Cleanup after tests
  });

  describe('#put()', function () {
    it('should store a shard successfully', async function () {
      const hash = 'testhash123';
      const data = Buffer.from('test data');

      await storage.put(hash, data);

      const filePath = path.join(storagePath, hash);
      const storedData = await fs.readFile(filePath);
      expect(storedData.toString()).to.equal('test data');
    });

    it('should throw an error when storing non-buffer data', async function () {
      const hash = 'invalidhash';
      const data = 'string data'; // Invalid, should be Buffer

      try {
        await storage.put(hash, data);
      } catch (error) {
        expect(error.message).to.equal('Data must be a Buffer');
      }
    });

    it('should throw an error if the shard size exceeds limit', async function () {
      const hash = 'bigfilehash';
      const bigData = Buffer.alloc(storage.MAX_SHARD_SIZE + 1); // Exceeds limit

      try {
        await storage.put(hash, bigData);
      } catch (error) {
        expect(error.message).to.include('Shard size exceeds the limit');
      }
    });
  });

  describe('#get()', function () {
    it('should retrieve a stored shard successfully', async function () {
      const hash = 'retrievablehash';
      const data = Buffer.from('retrievable data');

      await storage.put(hash, data);
      const retrievedData = await storage.get(hash);

      expect(retrievedData.toString()).to.equal('retrievable data');
    });

    it('should throw a ShardNotFoundError if the shard does not exist', async function () {
      const hash = 'nonexistenthash';

      try {
        await storage.get(hash);
      } catch (error) {
        expect(error).to.be.instanceOf(ShardNotFoundError);
        expect(error.message).to.include('Shard not found');
      }
    });
  });

  describe('#delete()', function () {
    it('should delete a shard successfully', async function () {
      const hash = 'deletablehash';
      const data = Buffer.from('deletable data');

      await storage.put(hash, data);
      await storage.delete(hash);

      try {
        await storage.get(hash);
      } catch (error) {
        expect(error).to.be.instanceOf(ShardNotFoundError);
      }
    });

    it('should not throw an error if deleting a non-existing shard', async function () {
      const hash = 'missinghash';
      await storage.delete(hash); // Should not throw
    });
  });

  describe('#list()', function () {
    it('should return a list of stored shard hashes', async function () {
      await storage.put('hash1', Buffer.from('data1'));
      await storage.put('hash2', Buffer.from('data2'));
      await storage.put('hash3', Buffer.from('data3'));

      const list = await storage.list();
      expect(list).to.have.members(['hash1', 'hash2', 'hash3']);
    });

    it('should return an empty array if no shards are stored', async function () {
      const list = await storage.list();
      expect(list).to.be.an('array').that.is.empty;
    });
  });

  describe('#getStats()', function () {
    it('should return correct storage statistics', async function () {
      await storage.put('hash1', Buffer.from('data1'));
      await storage.put('hash2', Buffer.from('data2'));
      await storage.put('hash3', Buffer.from('data3'));

      const stats = await storage.getStats();
      expect(stats.totalShards).to.equal(3);
      expect(stats.totalSize).to.equal(15); // 'data1' + 'data2' + 'data3' = 15 bytes
      expect(stats.averageSize).to.equal(5); // 15 bytes / 3 shards
    });

    it('should return zero values if no shards are stored', async function () {
      const stats = await storage.getStats();
      expect(stats.totalShards).to.equal(0);
      expect(stats.totalSize).to.equal(0);
      expect(stats.averageSize).to.equal(0);
    });
  });
});
