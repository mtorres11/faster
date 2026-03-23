import type { BiblePassage, IBibleContentProvider } from './bible-content.provider.interface.js';

/**
 * Placeholder until licensed API is wired.
 */
export class StubBibleContentProvider implements IBibleContentProvider {
  async listVersions(): Promise<{ id: string; name: string }[]> {
    return [
      { id: 'stub_en', name: 'Stub English' },
      { id: 'stub_es', name: 'Stub Español' },
    ];
  }

  async getPassage(versionId: string, reference: string): Promise<BiblePassage | null> {
    return {
      versionId,
      reference,
      text: '[Bible text will load from your configured provider.]',
    };
  }
}
