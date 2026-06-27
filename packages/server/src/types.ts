export interface RequestContext { did: string; scopes: string[]; }
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export interface RouteConfig { path: string; method: HttpMethod; auth: boolean; }
