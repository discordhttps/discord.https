import { basename, flatten } from "../utils/Util.js";
import { DiscordHttpsErrorCodes, DiscordHttpsError } from "../errors/index.js";

export interface AttachmentData {
  description?: string;
  duration?: number;
  name: string;
  title?: string;
  waveform?: string;
}

export type BufferResolvable = Blob | File | Uint8Array;

/**
 * Represents an attachment builder
 */
export class AttachmentBuilder {
  /**
   * The file associated with this attachment.
   */
  attachment: BufferResolvable;

  /**
   * The name of this attachment
   */
  name: string;

  /**
   * The description of this attachment
   */
  description?: string;

  /**
   * The title of the attachment
   */
  title?: string;

  /**
   * The base64 encoded byte array representing a sampled waveform
   * @remarks This is only for voice message attachments
   */
  waveform?: string;

  /**
   * The duration of the attachment in seconds
   * @remarks This is only for voice message attachments
   */
  duration?: number;

  /**
   * @param attachment The file
   * @param data Extra data
   */

  constructor(attachment: BufferResolvable, data: AttachmentData) {
    this.attachment = attachment;

    /**
     * The name of this attachment
     */
    this.name = data.name ?? "file";

    /**
     * The description of the attachment
     */
    this.description = data.description;

    /**
     * The title of the attachment
     */
    this.title = data.title;

    /**
     * The base64 encoded byte array representing a sampled waveform
     * <info>This is only for voice message attachments.</info>
     *
     * @type {?string}
     */
    this.waveform = data.waveform;

    /**
     * The duration of the attachment in seconds
     * <info>This is only for voice message attachments.</info>
     *
     * @type {?number}
     */
    this.duration = data.duration;
  }

  /**
   * Sets the description of this attachment.
   *
   * @param description The description of the file
   * @returns This attachment
   */
  setDescription(description: string) {
    this.description = description;
    return this;
  }

  /**
   * Sets the file of this attachment.
   *
   * @param  attachment The file
   * @returns This attachment
   */
  setFile(attachment: BufferResolvable) {
    this.attachment = attachment;
    return this;
  }

  /**
   * Sets the name of this attachment.
   *
   * @param  name The name of the file
   * @returns This attachment
   */
  setName(name: string) {
    this.name = name;
    return this;
  }

  /**
   * Sets the title of this attachment.
   *
   * @param title The title of the file
   * @returns This attachment
   */
  setTitle(title: string) {
    this.title = title;
    return this;
  }

  /**
   * Sets the waveform of this attachment.
   * @remarks This is only for voice message attachments.
   *
   * @param waveform The base64 encoded byte array representing a sampled waveform
   * @returns This attachment
   */
  setWaveform(waveform: string) {
    this.waveform = waveform;
    return this;
  }

  /**
   * Sets the duration of this attachment.
   * @remarks This is only for voice message attachments.
   *
   * @param duration The duration of the attachment in seconds
   * @returns This attachment
   */
  setDuration(duration: number) {
    this.duration = duration;
    return this;
  }

  /**
   * Sets whether this attachment is a spoiler
   *
   * @param spoiler Whether the attachment should be marked as a spoiler
   * @returns This attachment
   */
  setSpoiler(spoiler = true) {
    if (spoiler === this.spoiler) return this;

    if (!spoiler) {
      // Why is the while here? It seems a bit odd. It was in djs, and I’m just porting it, but having a while here feels unusual.
      while (this.spoiler) {
        this.name = this.name.slice("SPOILER_".length);
      }
      return this;
    }
    this.name = `SPOILER_${this.name}`;
    return this;
  }

  /**
   * Whether or not this attachment has been marked as a spoiler
   * @readonly
   */
  get spoiler(): boolean {
    return basename(this.name).startsWith("SPOILER_");
  }

  /**
   * Create an attachment from url
   */
  async fromURL(
    url: string,
    data: Partial<AttachmentData>,
    requestOptions: any
  ) {
    const filerHttpResponse = await fetch(url, {
      ...requestOptions,
    });
    const contentType = filerHttpResponse.headers.get("content-type");

    if (!contentType || !data.name) {
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.FetchResponseContentTypeNotProvided
      );
    }

    if (!filerHttpResponse.body) {
      throw new DiscordHttpsError(DiscordHttpsErrorCodes.FileNotFound, url);
    }
    const fileBuffer = await filerHttpResponse.arrayBuffer();
    const file = new Uint8Array(fileBuffer);
    return new AttachmentBuilder(file, {
      name: data.name ?? "file" + contentType,
    });
  }

  toJSON() {
    return flatten(this);
  }
}
