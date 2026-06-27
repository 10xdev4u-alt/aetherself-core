/**
 * AetherSelf Client SDK — interact with the local daemon.
 */

export interface ClientConfig {
  baseUrl?: string;
  token?: string;
}

const DEFAULT_BASE = "http://127.0.0.1:4197";

export class AetherSelfClient {
  private baseUrl: string;
  private token: string | null;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE;
    this.token = config.token ?? null;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json() as Promise<T>;
  }

  async getIdentity() {
    return this.request<{ did: string; encryptedPayload: string }>("GET", "/v1/identity");
  }

  async updateIdentity(encryptedPayload: string) {
    return this.request<{ status: string }>("PUT", "/v1/identity", { encryptedPayload });
  }

  async getMemories(query?: string, limit?: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (limit) params.set("limit", String(limit));
    return this.request<{ results: unknown[] }>("GET", `/v1/memory?${params}`);
  }

  async appendMemory(memory: Record<string, unknown>) {
    return this.request<{ id: string }>("POST", "/v1/memory", memory);
  }

  async getContexts() {
    return this.request<{ contexts: unknown[] }>("GET", "/v1/context");
  }

  async setContext(activity: string, platform?: string) {
    return this.request<{ id: string }>("POST", "/v1/context", { activity, platform });
  }

  async getPreferences(category?: string) {
    const params = category ? `?category=${category}` : "";
    return this.request<{ preferences: unknown[] }>("GET", `/v1/preferences${params}`);
  }

  async setPreference(key: string, value: string, category?: string) {
    return this.request<{ status: string }>("POST", "/v1/preferences", { key, value, category });
  }

  async getRelationships() {
    return this.request<{ relationships: unknown[] }>("GET", "/v1/relationships");
  }

  async health() {
    return this.request<{ status: string; uptime: number }>("GET", "/health");
  }

  async wellKnown() {
    return this.request<{ version: string; capabilities: string[] }>("GET", "/.well-known/aetherself");
  }
}
