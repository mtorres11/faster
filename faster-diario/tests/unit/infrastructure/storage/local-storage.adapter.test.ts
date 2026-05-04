/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageKeyValueStorage } from '../../../../src/infrastructure/storage/local-storage.adapter.js';

describe('LocalStorageKeyValueStorage', () => {
  let s: LocalStorageKeyValueStorage;

  beforeEach(() => {
    localStorage.clear();
    s = new LocalStorageKeyValueStorage();
  });

  it('get/set/remove roundtrip', async () => {
    expect(await s.getItem('a')).toBeNull();
    await s.setItem('a', '1');
    expect(await s.getItem('a')).toBe('1');
    await s.removeItem('a');
    expect(await s.getItem('a')).toBeNull();
  });

  it('getItem swallows localStorage read errors', async () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const store = new LocalStorageKeyValueStorage();
    expect(await store.getItem('k')).toBeNull();
    spy.mockRestore();
  });
});
