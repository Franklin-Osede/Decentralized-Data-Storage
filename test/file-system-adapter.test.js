const { expect } = require('chai');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const FileSystemStorageAdapter = require('../../lib/storage/file-system-adapter');
const { ShardNotFoundError } = require('../../lib/storage/errors');

describe('FileSystemStorageAdapter', () => {
  let storagePath;
  let adapter;

  beforeEach(async () => {
    storagePath = path.join(os.tmpdir(), `storj-test-${Date.now()}`);
    await fs.mkdir(storagePath, { recursive: true });
    adapter = new FileSystemStorageAdapter(storagePath);
  });

  afterEach(async () => {
    await fs.rm(storagePath, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should throw if storage path is not provided', () => {
      expect(() => new FileSystemStorageAdapter()).to.throw('Storage path is required');
    });
  });

  describe('put', () => {
    it('should store data and return hash', async () => {
      const hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const data = Buffer.from('test data');

      const result = await adapter.put(hash, data);
      expect(result).to.equal(hash);

      const storedData = await fs.readFile(path.join(storagePath, hash));
      expect(storedData.equals(data)).to.be.true;
    });

    it('should throw on invalid hash', async () => {
      await expect(adapter.put('', Buffer.from('data')))
        .to.be.rejectedWith('Invalid hash');
    });

    it('should throw if data is not a Buffer', async () => {
      await expect(adapter.put('hash', 'not a buffer'))
        .to.be.rejectedWith('Data must be a Buffer');
    });
  });

  describe('get', () => {
    it('should retrieve stored data', async () => {
      const hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const data = Buffer.from('test data');

      await adapter.put(hash, data);
      const retrieved = await adapter.get(hash);

      expect(retrieved.equals(data)).to.be.true;
    });

    it('should throw ShardNotFoundError for non-existent hash', async () => {
      await expect(adapter.get('nonexistent'))
        .to.be.rejectedWith(ShardNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete stored data', async () => {
      const hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      await adapter.put(hash, Buffer.from('test'));
      await adapter.delete(hash);

      await expect(adapter.get(hash))
        .to.be.rejectedWith(ShardNotFoundError);
    });

    it('should not throw when deleting non-existent hash', async () => {
      await expect(adapter.delete('nonexistent'))
        .to.be.fulfilled;
    });
  });

  describe('list', () => {
    it('should list all stored shards', async () => {
      const hashes = [
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      ];

      await Promise.all(hashes.map(hash =>
        adapter.put(hash, Buffer.from('data'))
      ));

      const listed = await adapter.list();
      expect(listed.sort()).to.deep.equal(hashes.sort());
    });

    it('should return empty array for empty storage', async () => {
      const listed = await adapter.list();
      expect(listed).to.be.an('array').that.is.empty;
    });
  });
});