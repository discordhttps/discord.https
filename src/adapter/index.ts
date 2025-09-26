/**
 * Represents a generic HTTP adapter for handling incoming requests and responses.
 *
 * **Required Methods:**
 * - `listen(endpoint, handler, ...args)` – Starts listening on a given endpoint and routes
 *   incoming requests to the provided handler.
 * - `getRequestBody(req)` – Retrieves the raw body of a request as a `Uint8Array`.
 *
 * Any adapter must implement these methods to be compatible with this library.
 *
 * Prebuilt adapters are available:
 * - [Node.js Adapter](https://www.npmjs.com/package/@discordhttps/nodejs-adapter)
 * - [Cloudflare Adapter](https://www.npmjs.com/package/@discordhttps/cloudflare-adapter)
 */

export interface HttpAdapter {
  listen(
    endpoint: string,
    handler: (req: any, res: any) => Promise<any>,
    ...args: any[]
  ): Promise<any> | any;

  getRequestBody(req: any): Promise<Uint8Array>;
}

/**
 * Represents a response object for an HTTP adapter.
 */

export interface HttpAdapterSererResponse {
  headersSent: boolean;
  writeHead(status: number, headers?: Record<string, string>): void;
  end(chunk?: string): void;
}

/**
 * Represents a request object for an HTTP adapter.
 */

export interface HttpAdapterRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[]>;
}
