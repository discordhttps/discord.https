import type { MessagePayload } from "../MessagePayload.js";
import { HttpAdapterSererResponse } from "../../adapter/index.js";

const mimeTypes: Record<string, string> = {
  txt: "text/plain",
  json: "application/json",
  csv: "text/csv",
  html: "text/html",
  xml: "application/xml",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
};

interface Field {
  name: string;
  data: Record<string, any> | Uint8Array | ReadableStream;
  filename?: string;
}

export class MultipartData {
  static boundary: string = "------------discord.https";
  // fields: Field[];
  chunks: Uint8Array[] = [];
  constructor() {
    // this.fields = [];
  }

  static getHeader() {
    return `multipart/form-data; boundary=${MultipartData.boundary}`;
  }

  static getContentType(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext && mimeTypes[ext] ? mimeTypes[ext] : "application/octet-stream";
  }
  // PREVIOUS SET METHOD, ORIGINALLY BUILT FOR HTTP CHUNKING

  // set(
  //   name: string,
  //   data: Record<string, any> | Uint8Array | ReadableStream,
  //   filename?: string
  // )
  set(name: string, data: Record<string, any> | Uint8Array, filename?: string) {
    const encoder = new TextEncoder();
    // Build partial header
    let header = `--${MultipartData.boundary}\r\n`;
    header += `Content-Disposition: form-data; name="${name}"`;
    if (filename) header += `; filename="${filename}"`;
    const contentType = filename
      ? MultipartData.getContentType(filename)
      : "application/json";
    header += `\r\nContent-Type: ${contentType}\r\n\r\n`;
    this.chunks.push(encoder.encode(header));

    // Append field data
    if (data instanceof Uint8Array) {
      this.chunks.push(data);
    } else {
      this.chunks.push(encoder.encode(JSON.stringify(data)));
    }
    this.chunks.push(encoder.encode("\r\n"));
    return this;
  }

  toUint8Array() {
    this.chunks.push(
      new TextEncoder().encode(`--${MultipartData.boundary}--\r\n`)
    );
    const totalChunks = this.chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );
    const result = new Uint8Array(totalChunks);
    var offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  static buildFromMessagePayload(messagePayload: MessagePayload) {
    const form = new MultipartData();
    form.set("payload_json", messagePayload.body);
    messagePayload.files?.map((e, i) => {
      form.set(`files[${i}]`, e.data, e.name);
    });
    return form.toUint8Array();
  }

  // async send(res: HttpAdapterSererResponse) {
  //   res.end(await this.build());
  // }

  // Instead of loading into memory, the data could be forwarded
  // as it is received from the URL or any other stream.
  // The adapter does not have a write method, and @discord/rset
  // accumulates data, which makes no difference in effect.
  // A custom request handler will be built soon, so this code
  // is kept here for future use.
  
  // buildStreamable(): ReadableStream<Uint8Array> {
  //   const encoder = new TextEncoder();
  //   const self = this;
  //   const getContentType = this.getContentType.bind(this);
  //   self.fields.sort((a, b) => {
  //     if (a.name === "payload_json") return -1;
  //     if (b.name === "payload_json") return -1;
  //     return 0;
  //   });
  //   return new ReadableStream({
  //     async start(controller) {
  //       for (const field of self.fields) {
  //         // start partial header--
  //         let partialHeader = "--" + self.boundary + "\r\n";
  //         partialHeader +=
  //           'Content-Disposition: form-data; name="' + field.name + '"';
  //         if (field.filename)
  //           partialHeader += '; filename="' + field.filename + '"';
  //         const contentType = field.filename
  //           ? getContentType(field.filename)
  //           : "application/json";
  //         partialHeader += "\r\n";
  //         partialHeader += "Content-Type:" + " " + contentType;
  //         partialHeader += "\r\n\r\n";
  //         controller.enqueue(encoder.encode(partialHeader));
  //         // --end partial header

  //         if (field.data instanceof Uint8Array) {
  //           controller.enqueue(field.data);
  //         } else if (field.data instanceof ReadableStream) {
  //           const reader = field.data.getReader();
  //           while (true) {
  //             const { done, value } = await reader.read();
  //             if (done) break;
  //             controller.enqueue(value);
  //           }
  //         } else {
  //           controller.enqueue(encoder.encode(JSON.stringify(field.data)));
  //         }
  //         // -- End of the field
  //         controller.enqueue(encoder.encode("\r\n"));
  //       }
  //       // final boundary
  //       controller.enqueue(encoder.encode(`--${self.boundary}--\r\n`));
  //       controller.close();
  //     },
  //   });
  // }
}
