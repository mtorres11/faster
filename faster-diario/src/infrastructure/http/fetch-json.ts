export class HttpJsonError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly status: number,
    public readonly bodySnippet?: string
  ) {
    super(message);
    this.name = 'HttpJsonError';
  }
}

/**
 * GET JSON with explicit error surface for UI and logging.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers || {}) },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new HttpJsonError('Network error: ' + msg, url, 0);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new HttpJsonError(
      'HTTP ' + res.status + ' for ' + url,
      url,
      res.status,
      text.slice(0, 200)
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpJsonError('Invalid JSON from ' + url, url, res.status, text.slice(0, 200));
  }
}
