import { Attachment } from "../../Attachment/Attachment.js";
import { BaseInteraction } from "../BaseInterction.js";
import { InteractionWebhook } from "../../InteractionWebhook.js";
import { MessageFlagsBitField } from "../../Bitfield/MessageFlags.js";
import { CommandInteractionOption } from "./BaseOptionResolver.js";
import { InteractionCallbackResponse } from "../../InteractionCallback/InteractionCallbackResponse.js";
import {
  BaseInteractionResponseMixin,
  AttachShowModalMethod,
} from "../InteractionReponseMixin.js";

import { makeURLSearchParams } from "@discordjs/rest";

import {
  ApplicationCommandType,
  MessageFlags,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";

import {
  DiscordHttpsError,
  DiscordHttpsErrorCodes,
} from "../../errors/index.js";

import {
  type InteractionReplyOptions,
  type BaseMessageOptionsWithPoll,
  MessagePayload,
} from "../../MessagePayload.js";

import type {
  APIApplicationCommandOption,
  APIApplicationCommandInteraction,
  APIInteractionDataResolved,
  APIMessage,
} from "discord-api-types/v10";

import type * as djs from "discord.js";
import type Client from "../../../index.js";
import type { Snowflake } from "discord-api-types/v10";
import type { HttpAdapterSererResponse } from "../../../adapter/index.js";

export interface InteractionEditReplyOptions
  extends djs.WebhookMessageEditOptions {
  /**
   * The response to edit.
   * Defaults to '@original'.
   */
  message?: "@original";
}

/**
 *"Initial" refers to the state where the response is about to be sent.
 */
type InitialInteractionReply = BaseMessageOptionsWithPoll;
/**
 * Refers to the state where the response has already been sent, and any further responses will now be sent via an HTTP request.
 * @deprecated
 */
export type InteractionReply = BaseMessageOptionsWithPoll & {
  withResponse?: boolean;
};

/** @deprecated */
export type InteractionReplySignature = {
  reply: (options: string | InteractionReply) => void;
};

export type AfterReplyCommandInteractionSignature = CommandInteraction & {
  reply(
    options: BaseMessageOptionsWithPoll & { withResponse?: false }
  ): Promise<undefined>;
  reply(
    options: BaseMessageOptionsWithPoll & { withResponse: true }
  ): Promise<InteractionCallbackResponse>;
};

/**
 * Interface for classes that support shared interaction response types.
 *
 * @interface
 */

/**
 * Represents a command interaction received from Discord.
 *
 * Extends BaseInteraction and implements the InteractionResponses interface.
 *
 * @extends BaseInteraction
 * @abstract
 */

export abstract class CommandInteraction extends BaseInteractionResponseMixin(
  AttachShowModalMethod(BaseInteraction)
) {
  /** The ID of the invoked application command */
  public commandId: Snowflake;

  /** The name of the invoked application command */
  public commandName: string;

  /** The type of the invoked application command */
  public commandType: ApplicationCommandType;

  /** The ID of the guild this command is registered to, if any */
  public commandGuildId: Snowflake | null;

  /** Whether the reply has been deferred */
  public deferred: boolean;

  /** Whether this interaction has already been replied to */
  public replied: boolean;

  /** Whether the reply is ephemeral (visible only to the user) */
  public ephemeral: boolean | null;

  /** A webhook associated with this interaction */
  public webhook: InteractionWebhook;

  /**
   * Creates a new CommandInteraction.
   *
   * @param {Client} client The client instance
   * @param {APIApplicationCommandInteraction} data The raw interaction data
   */

  constructor(
    readonly client: Client,
    data: APIApplicationCommandInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data);
    this.commandId = data.data.id as unknown as Snowflake;
    this.commandName = data.data.name;
    this.commandType = data.data.type;
    this.commandGuildId = (data.data.guild_id as Snowflake | undefined) ?? null;
    this.deferred = false;
    this.replied = false;
    this.ephemeral = null;
    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );
    Object.defineProperty(this, "res", { value: res });
  }

  /**
   * @internal
   *
   * Resolves a raw API option into a CommandInteractionOption with resolved entities.
   * @private
   */
  _transformOption(
    option: APIApplicationCommandOption,
    resolved: APIInteractionDataResolved | undefined
  ) {
    const result = {
      name: option.name,
      type: option.type,
    } as CommandInteractionOption;
    if ("value" in option) result.value = option.value as any;
    if ("options" in option)
      result.options = option.options?.map((opt) =>
        this._transformOption(opt, resolved)
      );
    if (resolved && "value" in option) {
      const user = resolved.users?.[option.value as any];
      if (user) result.user = user;

      const member = resolved.members?.[option.value as any];
      if (member) result.member = member;

      const channel = resolved.channels?.[option.value as any];
      if (channel) result.channel = channel;

      const role = resolved.roles?.[option.value as any];
      if (role) result.role = role;

      const attachment = resolved.attachments?.[option.value as any];
      if (attachment) result.attachment = new Attachment(attachment);
    }
    return result;
  }
}

// InteractionResponses.applyToClass(CommandInteraction, [
//   "deferUpdate",
//   "update",
// ]);
