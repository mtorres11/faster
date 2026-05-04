import { afterEach, describe, expect, it } from 'vitest';
import {
  createKeyValueStorage,
  getAppKeyValueStorage,
  resetAppKeyValueStorageForTests,
} from '../../../../src/infrastructure/storage/storage.factory.js';
import { LocalStorageKeyValueStorage } from '../../../../src/infrastructure/storage/local-storage.adapter.js';

describe('storage.factory', () => {
  afterEach(() => {
    resetAppKeyValueStorageForTests();
  });

  it('createKeyValueStorage returns LocalStorageKeyValueStorage', () => {
    const k = createKeyValueStorage();
    expect(k).toBeInstanceOf(LocalStorageKeyValueStorage);
  });

  it('getAppKeyValueStorage returns the same singleton', () => {
    const a = getAppKeyValueStorage();
    const b = getAppKeyValueStorage();
    expect(a).toBe(b);
    resetAppKeyValueStorageForTests();
    const c = getAppKeyValueStorage();
    expect(c).not.toBe(a);
  });
});
