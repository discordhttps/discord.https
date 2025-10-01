// reference =>
// https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/errors/ErrorCodes.js
// https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/InteractionCallbackResponse.js

import {
  type InteractionReplyOptions,
  MessagePayload,
} from "../structures/MessagePayload.js";
import { DiscordHttpsError, DiscordHttpsErrorCodes } from "./errors/index.js";

import { makeURLSearchParams } from "@discordjs/rest";
import { Routes, type APIMessage, type Snowflake } from "discord-api-types/v10";

import type Client from "../index.js";

/**
 * Represents a webhook for an Interaction
 */
export class InteractionWebhook {
  id: Snowflake;
  token!: string;
  /**
   * @param client The instantiating client
   * @param id The application's id
   * @param token The interaction's token
   */
  constructor(readonly client: Client, id: Snowflake, token: string) {
    Object.defineProperty(this, "client", { value: client });
    this.id = id;
    Object.defineProperty(this, "token", {
      value: token,
      writable: true,
      configurable: true,
    });
  }

  /**
   * Sends a message with this webhook.
   *
   * @param  options The content for the reply
   * @returns {Promise<Message>}
   */

  async send(
    options: { withResponse: true } & (MessagePayload | InteractionReplyOptions)
  ): Promise<APIMessage>;
  async send(
    options:
      | string
      | ((MessagePayload | InteractionReplyOptions) & {
          withResponse?: false;
        })
  ): Promise<undefined>;
  async send(
    options:
      | string
      | ((MessagePayload | InteractionReplyOptions) & {
          withResponse?: boolean;
        })
  ): Promise<undefined | APIMessage> {
    if (!this.token)
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.WebhookTokenUnavailable
      );

    let messagePayload =
      options instanceof MessagePayload
        ? options
        : MessagePayload.create(this as any, options);

    const { body, files } = await messagePayload.resolveBody().resolveFiles();

    const isWait = (options as any).withResponse;
    const query = makeURLSearchParams({
      wait: !!isWait,
      thread_id: (messagePayload.options as any).threadId,
      with_components: (messagePayload.options as any).withComponents,
    });

    const data = await this.client.rest.post(
      Routes.webhook(this.id, this.token),
      {
        body,
        files: files as any,
        query,
        auth: false,
      }
    );
    return isWait ? (data as APIMessage) : undefined;
    // if (!this.client.channels) return data;
    // return (
    //   this.client.channels.cache
    //     .get(data.channel_id)
    //     ?.messages._add(data, false) ??
    //   new (await getMessage())(this.client, data)
    // );
  }

  /**
   * Gets a message that was sent by this webhook.
   *
   * @param message The id of the message to fetch
   * @returns Returns the message sent by this webhook
   */

  async fetchMessage(message: Snowflake | "@original"): Promise<APIMessage> {
    if (!this.token)
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.WebhookTokenUnavailable
      );
    const data = await this.client.rest.get(
      Routes.webhookMessage(this.id, this.token, message),
      {
        auth: false,
      }
    );
    return data as APIMessage;
  }

  /**
   * Edits a message that was sent by this webhook.
   *
   * message The message to edit
   * @param  options The options to provide
   * @returns Returns the message edited by this webhook
   */
  async editMessage(
    message: Snowflake | "@original",
    options: string | ({ withResponse: true } & MessagePayload)
  ): Promise<APIMessage>;
  async editMessage(
    message: Snowflake | "@original",
    options: string | (MessagePayload & { withResponse?: false })
  ): Promise<undefined>;
  async editMessage(
    message: Snowflake | "@original" = "@original",
    options: string | (MessagePayload & { withResponse?: boolean })
  ) {
    if (!this.token)
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.WebhookTokenUnavailable
      );
    let messagePayload =
      options instanceof MessagePayload
        ? options
        : MessagePayload.create(this as any, options);

    const { body, files } = await messagePayload.resolveBody().resolveFiles();

    const isWait = (options as any).withResponse;
    const query = makeURLSearchParams({
      wait: !!isWait,
      thread_id: (messagePayload.options as any).threadId,
      with_components: (messagePayload.options as any).withComponents,
    });

    const data = await this.client.rest.patch(
      Routes.webhookMessage(this.id, this.token, message),
      {
        body,
        files: files as any,
        query,
        auth: false,
      }
    );
    return isWait ? (data as APIMessage) : undefined;
    // if (!this.client.channels) return data;
    // return (
    //   this.client.channels.cache
    //     .get(data.channel_id)
    //     ?.messages._add(data, false) ??
    //   new (await getMessage())(this.client, data)
    // );
  }

  /**
   * Delete a message that was sent by this webhook.
   *
   * @param message The message to delete
   * @param threadId The id of the thread this message belongs to
   */

  async deleteMessage(
    message: Snowflake | "@original" = "@original",
    threadId?: Snowflake
  ) {
    if (!this.token)
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.WebhookTokenUnavailable
      );
    await this.client.rest.delete(
      Routes.webhookMessage(this.id, this.token, message),
      {
        query: threadId
          ? makeURLSearchParams({ thread_id: threadId })
          : undefined,
        auth: false,
      }
    );
  }
}
