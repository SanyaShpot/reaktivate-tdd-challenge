import { API_BASE } from "./config";

export interface HttpGateway {
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
  post<T>(path: string, payload: unknown, signal?: AbortSignal): Promise<T>;
}

export class ApiGateway implements HttpGateway {
  get = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, { signal });
    return this.parse<T>(response);
  };

  post = async <T>(
    path: string,
    payload: unknown,
    signal?: AbortSignal
  ): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    return this.parse<T>(response);
  };

  private parse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
  };
}
