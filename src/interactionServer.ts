import { verifyAsync } from "@noble/ed25519";

import { APIInteraction } from "discord-api-types/v10";

import type {
  HttpAdapter,
  HttpAdapterRequest,
  HttpAdapterSererResponse,
} from "./adapter/index.js";

export type HttpInteractionPayloadHandlerSignature = (
  payload: APIInteraction,
  res: HttpAdapterSererResponse
) => Promise<void>;

export default class HttpInteractionServer {
  protected isDebug = false;

  constructor(
    private publicKey: string,
    private httpAdapter: HttpAdapter,
    debug = false
  ) {
    if (!publicKey) this.throwError("publicKey must be provided!");
    if (!httpAdapter) this.throwError("adapter must be provided!");

    this.isDebug = debug;
    this.httpAdapter = httpAdapter;
    Object.defineProperty(this, "publicKey", {
      value: publicKey,
    });
  }
  private throwError(message: string) {
    throw new Error(`[class:HttpInteractionServer - discord.https] ${message}`);
  }
  private lightError(message: string) {
    console.error(`[class:HttpInteractionServer - discord.https] ${message}`);
  }

  private async httpHandler(
    endpoint: string,
    req: HttpAdapterRequest,
    res: HttpAdapterSererResponse
  ) {
    this.debug("HTTP request hit!");
    if (req.method === "GET") {
      res.writeHead(200);
      res.end("Server is alive!");
      return;
    } else if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST" });
      res.end();
      return;
    }

    // req.url should only be a pure path starting with "/" (no parameters).
    // Ignore if parameters are present, unless explicitly allowed in the endpoint.

    if (req.url !== endpoint) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Bad Endpoint");
      return;
    }

    if (req.headers["content-type"] !== "application/json") {
      res.writeHead(415);
      res.end();
      return;
    }

    this.debug("Getting request body!");
    const rawBody = await this.httpAdapter.getRequestBody(req);
    this.debug("Http request verification started!");
    const verified = await this.verifyPayload(req, rawBody);
    if (!verified) {
      this.debug("Http request verification failed!");
      res.writeHead(401);
      res.end();
      return;
    }
    this.debug("Http request verified!");

    this.debug("Parsing the request body!");
    const uint8ArrayDecoder = new TextDecoder();
    const plainBody = uint8ArrayDecoder.decode(rawBody);
    var body: APIInteraction;
    try {
      body = JSON.parse(plainBody);
      this.debug("Request body parsing complete!");
      this.httpInteractionPayloadHandler(body, res);
    } catch (e) {
      // To do: Won’t catch middleware errors or throw them in the next version.
      // An error-handling middleware will also be introduced for user to handle error themself.
      this.lightError("An error occurred while in middleware.");
      throw e;
      // res.writeHead(400);
      // res.end();
    }
  }
  protected httpInteractionPayloadHandler(
    payload: APIInteraction,
    res: HttpAdapterSererResponse
  ) {
    this.throwError(`method:httpInteractionPayloadHandler must be overridden`);
  }

  protected debug(...message: string[]) {
    if (this.isDebug) {
      const datePrefix = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return console.debug(
        `${datePrefix} [class:HttpInteractionServer - discord.https]`,
        ...message
      );
    }
  }

  private async verifyPayload(req: any, rawBody: Uint8Array) {
    const signature = req.headers["x-signature-ed25519"] as string | undefined;
    const timestamp = req.headers["x-signature-timestamp"] as
      | string
      | undefined;

    if (
      !signature ||
      !timestamp ||
      typeof signature !== "string" ||
      typeof timestamp !== "string"
    ) {
      return false;
    }

    const timestampBuffer = new TextEncoder().encode(timestamp);
    const messageBuffer = new Uint8Array(
      timestampBuffer.length + rawBody.length
    );
    messageBuffer.set(timestampBuffer, 0);
    messageBuffer.set(rawBody, timestampBuffer.length);

    const signatureBytes = this.hexToBytes(signature);
    const publicKeyBytes = this.hexToBytes(this.publicKey);

    return verifyAsync(signatureBytes, messageBuffer, publicKeyBytes);
  }

  private hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  getHandler(endpoint: string) {
    return this.httpHandler.bind(
      this,
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    );
  }
  async listen(endpoint: string, ...args: any): Promise<any> {
    const result = this.httpAdapter.listen(
      endpoint,
      this.getHandler(endpoint),
      ...args
    );
    // The listener can be Promise-based (e.g., a Promise is required for CloudflareAdapter)
    return await Promise.resolve(result);
  }
}
