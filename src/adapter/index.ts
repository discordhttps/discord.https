export interface HttpAdapter {
  listen(
    endpoint: string,
    handler: (req: any, res: any) => Promise<any>,
    ...args: any[]
  ): Promise<any> | any;

  getRequestBody(req: any): Promise<Uint8Array>;
}

export interface HttpAdapterSererResponse {
  headersSent: boolean;
  writeHead(status: number, headers?: Record<string, string>): void;
  end(chunk?: string): void;
}

export interface HttpAdapterRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[]>;
}
