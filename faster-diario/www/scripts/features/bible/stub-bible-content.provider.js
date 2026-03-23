/**
 * Placeholder until licensed API is wired.
 */
export class StubBibleContentProvider {
    async listVersions() {
        return [
            { id: 'stub_en', name: 'Stub English' },
            { id: 'stub_es', name: 'Stub Español' },
        ];
    }
    async getPassage(versionId, reference) {
        return {
            versionId,
            reference,
            text: '[Bible text will load from your configured provider.]',
        };
    }
}
