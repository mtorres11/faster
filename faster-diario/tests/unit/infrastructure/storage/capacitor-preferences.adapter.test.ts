import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CapacitorPreferencesKeyValueStorage } from '../../../../src/infrastructure/storage/capacitor-preferences.adapter.js';
import { Preferences } from '@capacitor/preferences';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockGet = vi.mocked(Preferences.get);
const mockSet = vi.mocked(Preferences.set);
const mockRemove = vi.mocked(Preferences.remove);

describe('CapacitorPreferencesKeyValueStorage', () => {
  let store: CapacitorPreferencesKeyValueStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ value: 'stored' });
    mockSet.mockResolvedValue();
    mockRemove.mockResolvedValue();
    store = new CapacitorPreferencesKeyValueStorage();
  });

  it('prefixes keys and roundtrips get/set/remove', async () => {
    expect(await store.getItem('a')).toBe('stored');
    expect(mockGet).toHaveBeenCalledWith({ key: 'kv_a' });
    await store.setItem('b', '2');
    expect(mockSet).toHaveBeenCalledWith({ key: 'kv_b', value: '2' });
    await store.removeItem('b');
    expect(mockRemove).toHaveBeenCalledWith({ key: 'kv_b' });
  });
});
