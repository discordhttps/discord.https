//Ported very very poorly.

// reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/MessagePayload.js

import {
  DiscordHttpsError,
  DiscordHttpsRangeError,
  DiscordHttpsErrorCodes,
  DiscordHttpsTypeError,
} from "./errors/index.js";

import { isJSONEncodable } from "@discordjs/util";
import { MessageFlags } from "discord-api-types/v10";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { MessageFlagsBitField } from "./Bitfield/MessageFlags.js";
import { MultipartData } from "./utils/multipart.js";
import {
  verifyString,
  resolvePartialEmoji,
  getInstanceName,
} from "./utils/Util.js";
import { AttachmentBuilder } from "./Attachment/AttachmentBuilder.js";

import type * as djs from "discord.js";

// Exported types from Discord.js instead of using them directly,
// because Discord.js uses Buffer in its type definitions, which isn’t
// supported in V8. V8 doesn’t have Buffer, so we either need to
// polyfill it or use a replacement. I prefer using a replacement
// for now, so I had to modify the base-level types.

export type MessagePayloadOption =
  | MessageCreateOptions
  | MessageEditOptions
  // | WebhookMessageCreateOptions
  // | WebhookMessageEditOptions
  | InteractionReplyOptions
  | InteractionUpdateOptions;

export interface InteractionReplyOptions extends BaseMessageOptionsWithPoll {
  tts?: boolean;
  withResponse?: boolean;
  flags?:
    | djs.BitFieldResolvable<
        Extract<
          djs.MessageFlagsString,
          | "Ephemeral"
          | "SuppressEmbeds"
          | "SuppressNotifications"
          | "IsComponentsV2"
        >,
        | MessageFlags.Ephemeral
        | MessageFlags.SuppressEmbeds
        | MessageFlags.SuppressNotifications
        | MessageFlags.IsComponentsV2
      >
    | undefined;
}

export interface InteractionUpdateOptions extends MessageEditOptions {
  withResponse?: boolean;
}

export interface BaseMessageOptions {
  content?: string;
  embeds?: readonly (djs.JSONEncodable<djs.APIEmbed> | djs.APIEmbed)[];
  allowedMentions?: djs.MessageMentionOptions;
  files?: readonly AttachmentBuilder[];
  components?: readonly (
    | djs.JSONEncodable<djs.APIMessageTopLevelComponent>
    | djs.TopLevelComponentData
    | djs.ActionRowData<
        djs.MessageActionRowComponentData | djs.MessageActionRowComponentBuilder
      >
    | djs.APIMessageTopLevelComponent
  )[];
}

// TODO!!
export interface MessageEditOptions
  extends Omit<BaseMessageOptions, "content"> {
  content?: string | null;
  // TODO!!
  // attachments?: readonly (Attachment | MessageEditAttachmentData)[];
  flags?:
    | djs.BitFieldResolvable<
        Extract<djs.MessageFlagsString, "SuppressEmbeds" | "IsComponentsV2">,
        MessageFlags.SuppressEmbeds | MessageFlags.IsComponentsV2
      >
    | undefined;
}

export interface BaseMessageOptionsWithPoll extends BaseMessageOptions {
  poll?: djs.PollData;
}

interface RawFile {
  /**
   * Content-Type of the file
   */
  contentType?: string;
  /**
   * The actual data for the file
   */
  data: Uint8Array | Blob;
  /**
   * An explicit key to use for key of the formdata field for this file.
   * When not provided, the index of the file in the files array is used in the form `files[${index}]`.
   * If you wish to alter the placeholder snowflake, you must provide this property in the same form (`files[${placeholder}]`)
   */
  key?: string;
  /**
   * The name of the file
   */
  name: string;
}

/**
 * Represents a message to be sent to the API.
 *
 * Sending attachments is **not supported** at the moment.
 * @remarks
 * WARNING ⚠️
 * This class is poorly coded and was rushed; it might need to be rewritten in the future.
 *
 * This is only for building an interaction message payload.
 * Using it to send actual messages may result in unexpected behavior.
 */

export interface MessageCreateOptions extends BaseMessageOptionsWithPoll {
  tts?: boolean;
  nonce?: string | number;
  enforceNonce?: boolean;
  reply?: djs.ReplyOptions;
  forward?: djs.ForwardOptions;
  stickers?: readonly djs.StickerResolvable[];
  flags?:
    | djs.BitFieldResolvable<
        Extract<
          djs.MessageFlagsString,
          "SuppressEmbeds" | "SuppressNotifications" | "IsComponentsV2"
        >,
        | MessageFlags.SuppressEmbeds
        | MessageFlags.SuppressNotifications
        | MessageFlags.IsComponentsV2
      >
    | undefined;
}

/**
 * Represents a message to be sent to the API.
 */

export class MessagePayload {
  /**
   * The target for this message to be sent to
   *
   */
  target: djs.MessageTarget;

  /**
   * The payload of this message.
   *
   */
  options: MessagePayloadOption;

  /**
   * Body sendable to the API
   *
   */
  body: any | null = null;

  /**
   * Files sendable to the API
   *
   */
  files: RawFile[] | null = null;

  /**
   * @param {MessageTarget} target The target for this message to be sent to
   */
  constructor(target: djs.MessageTarget, options: MessagePayloadOption) {
    this.target = target;
    this.options = options;
  }

  // /** Whether or not the target is a {@link Webhook} or a {@link WebhookClient} */
  // get isWebhook(): boolean {
  //   const { Webhook } = require("./Webhook");
  //   const { default: WebhookClient } = require("../client/WebhookClient");
  //   return (
  //     this.target instanceof Webhook || this.target instanceof WebhookClient
  //   );
  // }

  /** Whether or not the target is a {@link User} */
  // get isUser(): boolean {
  //   const { default: User } = require("./User");
  //   const { GuildMember } = require("./GuildMember");
  //   return this.target instanceof User || this.target instanceof GuildMember;
  // }

  /** Whether or not the target is a {@link Message} */
  // get isMessage(): boolean {
  //   const { Message } = require("./Message");
  //   return this.target instanceof Message;
  // }

  /** Whether or not the target is a {@link MessageManager} */
  // get isMessageManager(): boolean {
  //   const { default: MessageManager } = require("../managers/MessageManager");
  //   return this.target instanceof MessageManager;
  // }

  /**
   * Makes the content of this message.
   */
  makeContent(): string | null {
    let content: string | null = null;
    if (this.options.content === null) {
      content = "";
    } else if (this.options.content !== undefined) {
      content = verifyString(
        this.options.content,
        DiscordHttpsRangeError,
        DiscordHttpsErrorCodes.MessageContentType,
        true
      );
    }
    return content;
  }

  /**
   * Resolves the body.
   */
  resolveBody(): this {
    if (this.body) return this;

    const content = this.makeContent();
    const tts = Boolean((this.options as djs.MessageCreateOptions).tts);

    let nonce: string | number | undefined = (
      this.options as djs.MessageCreateOptions
    ).nonce;

    let enforce_nonce = Boolean(
      (this.options as djs.MessageCreateOptions).enforceNonce
    );

    if (nonce !== undefined) {
      if (
        typeof nonce === "number"
          ? !Number.isInteger(nonce)
          : typeof nonce !== "string"
      ) {
        throw new DiscordHttpsRangeError(
          DiscordHttpsErrorCodes.MessageNonceType
        );
      }
    } else if (
      (this.options as djs.MessageCreateOptions).enforceNonce !== false
    ) {
      nonce = DiscordSnowflake.generate().toString();
      enforce_nonce = true;
    } else if (enforce_nonce) {
      throw new DiscordHttpsError(DiscordHttpsErrorCodes.MessageNonceRequired);
    }
    const components = this.options.components?.map((component) => {
      if (isJSONEncodable(component)) {
        return component.toJSON();
      } else {
        throw new Error("Failed to parse component");
      }
    });

    let username: string | undefined;
    let avatarURL: string | undefined;
    let threadName: string | undefined;
    let appliedTags: unknown;

    // if (isWebhook) {
    //   username = this.options.username ?? this.target.name;
    //   avatarURL = this.options.avatarURL;
    //   threadName = this.options.threadName;
    //   appliedTags = this.options.appliedTags;
    // }

    let flags: number | undefined;
    if (this.options.flags != null) {
      flags = new MessageFlagsBitField(this.options.flags as any).bitfield;
    }

    let allowedMentions = this.options
      .allowedMentions as djs.MessageMentionOptions & {
      replied_user?: djs.MessageMentionOptions["repliedUser"];
    };

    if (allowedMentions?.repliedUser !== undefined) {
      allowedMentions = {
        ...allowedMentions,
        replied_user: allowedMentions.repliedUser,
      };
      delete allowedMentions.repliedUser;
    }

    let message_reference;
    if ("messageReference" in this.options && this.options.messageReference) {
      const reference = this.options.messageReference as djs.MessageReference;

      if (reference.messageId) {
        message_reference = {
          message_id: reference.messageId,
          channel_id: reference.channelId,
          guild_id: reference.guildId,
          type: reference.type,
          //@ts-ignore
          fail_if_not_exists: Boolean(reference.failIfNotExists),
        };
      }
    }
    // ATTCHMENTS NOT YET SUPPORTED!!
    const attachments = this.options.files?.map((file, index) => ({
      id: index.toString(),
      description: file.description,
      title: file.title,
      waveform: file.waveform,
      duration_secs: file.duration,
    }));
    // if (Array.isArray(this.options.attachments)) {
    //   this.options.attachments.push(...(attachments ?? []));
    // } else {
    //   this.options.attachments = attachments;
    // }

    let poll;
    if ("poll" in this.options) {
      poll = isJSONEncodable(this.options.poll)
        ? this.options.poll.toJSON()
        : {
            question: {
              text: this.options.poll!.question.text,
            },
            answers: this.options.poll!.answers.map((answer) => ({
              poll_media: {
                text: answer.text,
                emoji: resolvePartialEmoji(answer.emoji!),
              },
            })),
            duration: this.options.poll!.duration,
            allow_multiselect: this.options.poll!.allowMultiselect,
            layout_type: this.options.poll!.layoutType,
          };
    }

    this.body = {
      content,
      tts,
      nonce,
      enforce_nonce,
      embeds: this.options.embeds?.map((embed) => {
        if (isJSONEncodable(embed)) {
          return embed.toJSON();
        } else {
          throw new Error("Failed to parse embed");
        }
      }),
      components,
      username,
      avatar_url: avatarURL,
      allowed_mentions:
        // this.isMessage &&
        // message_reference === undefined &&
        // this.target.author.id !== this.target.client.user.id
        //   ? undefined :
        allowedMentions,
      flags,
      message_reference,
      attachments: this.options.files?.map((file, index) => ({
        name: file.name,
        id: index.toString(),
        description: file.description,
        title: file.title,
        waveform: file.waveform,
        duration_secs: file.duration,
      })),
      sticker_ids:
        "stickers" in this.options
          ? this.options.stickers?.map((sticker: djs.StickerResolvable) =>
              typeof sticker === "string" ? sticker : sticker.id
            )
          : [],
      thread_name: threadName,
      applied_tags: appliedTags,
      poll,
    };
    return this;
  }

  /**
   * Resolves files.
   */
  async resolveFiles() {
    if (this.files) return this;
    this.files = await Promise.all(
      this.options.files?.map((file) => {
        if (!(file instanceof AttachmentBuilder))
          throw new DiscordHttpsTypeError(
            DiscordHttpsErrorCodes.InvalidType,
            getInstanceName(file),
            "AttachmentBuilder"
          );

        const extStartIndex = (file.name ? file.name.lastIndexOf(".") : -1) + 1;
        let guessedContentType = extStartIndex
          ? MultipartData.getContentType(file.name.slice(extStartIndex))
          : undefined;
        // file.name ? file.name.split(".").pop()?.toLowerCase() : undefined; this doesn't cover files with multiple dots, like .env.local

        return {
          name: file.name ?? "file",
          data: file.attachment,
          contentType: guessedContentType,
        };
      }) ?? []
    );
    return this;
  }

  /**
   * Creates a {@link MessagePayload} from user-level arguments.
   */
  static create(
    target: djs.MessageTarget,
    options: string | MessagePayloadOption,
    extra: MessagePayloadOption = {}
  ) {
    return new this(
      target,
      typeof options !== "object" || options === null
        ? { content: options, ...extra }
        : ({ ...options, ...extra } as any)
    );
  }
}
