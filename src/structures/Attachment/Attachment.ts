import { AttachmentFlagsBitField } from "../Bitfield/AttachmentFlags.js";
import { APIAttachment } from "discord-api-types/v10";
import { basename } from "../utils/Util.js";

/**
 * Payload for creating or sending an attachment.
 */
export interface AttachmentPayload {
  /** The attachment data (file path, Buffer, or base64 string) */
  attachment: Buffer | Uint8Array | string;
  /** Optional name of the attachment */
  name?: string;
  /** Optional description (alt text) */
  description?: string;
  /** Optional title for the attachment */
  title?: string;
  /** Base64 encoded waveform for voice messages */
  waveform?: string;
  /** Duration in seconds for audio/voice attachments */
  duration?: number;
}

/**
 * Represents a Discord attachment.
 */
export class Attachment {
  /** The URL or path of the attachment */
  public attachment: string;

  /** The filename of the attachment */
  public name: string;

  /** The unique ID of the attachment */
  public id!: string;

  /** Size of the attachment in bytes */
  public size?: number;

  /** URL of the attachment */
  public url?: string;

  /** Proxy URL of the attachment */
  public proxyURL?: string;

  /** Height of the attachment if image/video, otherwise null */
  public height: number | null = null;

  /** Width of the attachment if image/video, otherwise null */
  public width: number | null = null;

  /** MIME type of the attachment */
  public contentType: string | null = null;

  /** Description (alt text) of the attachment */
  public description: string | null = null;

  /** Whether this attachment is ephemeral */
  public ephemeral: boolean = false;

  /**
   * Duration in seconds for audio/voice attachments.
   * @remarks This will only be available if the attachment is the audio file from a voice message.
   */
  public duration: number | null = null;

  /**
   * Base64 waveform for voice message attachments.
   * @remarks This will only be available if this attachment is the audio file from a voice message.
   */
  public waveform: string | null = null;

  /** Flags associated with the attachment */
  public flags?: Readonly<AttachmentFlagsBitField>;

  /**
   * Title of the attachment if present.
   * @remarks This will only be available if the attachment name contains special characters.
   */
  public title: string | null = null;

  /**
   * Constructs a new Attachment instance.
   * @param data Raw API attachment data
   */
  constructor(data: APIAttachment) {
    this.attachment = data.url;
    this.name = data.filename;
    this._patch(data);
  }

  /**
   * Internal method to patch/update the attachment with new data
   * @param data Raw API attachment data
   */
  private _patch(data: APIAttachment) {
    this.id = data.id;

    if ("size" in data) this.size = data.size;
    if ("url" in data) this.url = data.url;
    if ("proxy_url" in data) this.proxyURL = data.proxy_url;
    this.height = "height" in data ? data.height ?? null : this.height;
    this.width = "width" in data ? data.width ?? null : this.width;
    this.contentType =
      "content_type" in data ? data.content_type ?? null : this.contentType;
    this.description =
      "description" in data ? data.description ?? null : this.description;
    this.ephemeral = data.ephemeral ?? this.ephemeral;
    this.duration =
      "duration_secs" in data ? data.duration_secs ?? null : this.duration;
    this.waveform = "waveform" in data ? data.waveform ?? null : this.waveform;
    this.flags =
      "flags" in data
        ? new AttachmentFlagsBitField(data.flags).freeze()
        : new AttachmentFlagsBitField().freeze();
    this.title = "title" in data ? data.title ?? null : this.title;
  }

  /**
   * Whether this attachment is a spoiler (filename starts with `SPOILER_`).
   */
  get spoiler(): boolean {
    const filename = this.url ?? this.name;
    // could do just, filename.includes("SPOILER_"), but whatever
    return basename(filename).startsWith("SPOILER_");
  }

  /**
   * Serializes the attachment to a plain object suitable for JSON.
   */
  toJSON(): Record<string, any> {
    return { ...this };
  }
}
