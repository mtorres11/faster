export interface BiblePassage {
  versionId: string;
  reference: string;
  text: string;
}

export interface IBibleContentProvider {
  getPassage(versionId: string, reference: string): Promise<BiblePassage | null>;
  listVersions(): Promise<{ id: string; name: string }[]>;
}
