// Maybe i should use selective mixin like djs?

import { Attachment } from "../Attachment/Attachment.js";
import { BaseInteraction } from "./BaseInterction.js";
import { InteractionWebhook } from "../InteractionWebhook.js";
import { MessageFlagsBitField } from "../Bitfield/MessageFlags.js";
import { InteractionCallbackResponse } from "../InteractionCallback/InteractionCallbackResponse.js";
import { makeURLSearchParams } from "@discordjs/rest";
import { isJSONEncodable } from "@discordjs/util";
import { MultipartData } from "../utils/multipart.js";
import {
  ApplicationCommandType,
  MessageFlags,
  InteractionResponseType,
  Routes,
} from "discord-api-types/v10";

import { DiscordHttpsError, DiscordHttpsErrorCodes } from "../errors/index.js";

import {
  type InteractionReplyOptions,
  type BaseMessageOptionsWithPoll,
  MessagePayload,
} from "../MessagePayload.js";

import type {
  APIApplicationCommandOption,
  APIApplicationCommandInteraction,
  APIInteractionDataResolved,
  APIMessage,
  APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";

import type { ModalBuilder } from "@discordjs/builders";
import type * as djs from "discord.js";
import type Client from "../../index.js";
import type { Snowflake } from "discord-api-types/v10";
import type { HttpAdapterSererResponse } from "../../adapter/index.js";

export interface InteractionEditReplyOptions
  extends djs.WebhookMessageEditOptions {
  /**
   * The response to edit.
   * Defaults to '@original'.
   */
  message?: "@original";
}

export interface LaunchActivityOptions {
  withResponse?: boolean;
}

export interface ShowModalOptions {
  withResponse?: boolean;
}
export interface InteractionDeferUpdateOptions {
  withResponse?: boolean;
}

export function BaseInteractionResponseMixin<
  T extends new (...args: any[]) => BaseInteraction
>(Base: T) {
  return class extends Base {
    deferred!: boolean;
    replied!: boolean;
    ephemeral!: boolean | null;
    /** @internal  */
    readonly res!: HttpAdapterSererResponse;
    webhook!: InteractionWebhook;

    /**
     * Options for deferring the reply to an BaseInteraction.
     *
     * @remarks Only `MessageFlags.Ephemeral` can be set.
     * @example
     * // Defer the reply to this interaction
     * interaction.deferReply()
     * @example
     * // Defer to send an ephemeral reply later
     * interaction.deferReply({ flags: MessageFlags.Ephemeral })
     */
    deferReply(
      options: Omit<
        djs.InteractionDeferReplyOptions,
        "ephemeral" | "fetchReply" | "withResponse"
      > = {} // : asserts this is AfterReplyCommandInteractionSignature
    ) {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );
      else if (this.res.headersSent)
        throw new DiscordHttpsError(DiscordHttpsErrorCodes.HeadersSent);

      const resolvedFlags = new MessageFlagsBitField(options.flags as any);
      this.deferred = true;
      this.ephemeral = resolvedFlags.has(MessageFlags.Ephemeral);
      this.res.writeHead(200, {
        "Content-Type": "application/json",
      });
      this.res.end(
        JSON.stringify({
          type: InteractionResponseType.DeferredChannelMessageWithSource,
          data: {
            flags: resolvedFlags.bitfield,
          },
        })
      );
    }

    /**
     * Creates a reply to this interaction.
     * @remarks Use the withResponse option to get the interaction callback response if a response has already been sent.
     *
     * @example
     * ```ts
     * await interaction.reply("Hello world!");
     * ```
     *
     */
    async reply(
      options: string | (InteractionReplyOptions & { withResponse?: false })
    ): Promise<undefined>;
    async reply(
      options: string | (InteractionReplyOptions & { withResponse: true })
    ): Promise<InteractionCallbackResponse>;
    async reply(
      options:
        | string
        // | MessagePayload (to be added)
        | (InteractionReplyOptions & { withResponse?: boolean })
    ): Promise<InteractionCallbackResponse | undefined> {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );

      const messagePayload =
        options instanceof MessagePayload
          ? options
          : MessagePayload.create(this as any, options);

      const { body: data, files } = await messagePayload
        .resolveBody()
        .resolveFiles();

      // const { body: data } = messagePayload.resolveBody();

      const InteractonResponseObject = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data,
      };

      if (!this.res.headersSent) {
        this.res.writeHead(200, {
          "Content-Type": files?.length
            ? MultipartData.getHeader()
            : "application/json",
        });
        this.res.end(
          files?.length
            ? MultipartData.buildFromMessagePayload(messagePayload)
            : JSON.stringify(InteractonResponseObject)
        );
        this.ephemeral = Boolean(data.flags & MessageFlags.Ephemeral);
        this.replied = true;
        return undefined;
      } else {
        const response = await this.client.rest.post(
          Routes.interactionCallback(this.id, this.token),
          {
            body: InteractonResponseObject,
            files,
            auth: false,
            query: makeURLSearchParams({
              with_response: (options as any).withResponse ?? false,
            }),
          }
        );
        this.ephemeral = Boolean(data.flags & MessageFlags.Ephemeral);
        this.replied = true;

        return (options as any).withResponse && this.res.headersSent
          ? (new InteractionCallbackResponse(
              this.client,
              response as any
            ) as any)
          : undefined;
      }
    }

    /**
     * Fetches a reply to this interaction.
     *
     * @example
     *  ```ts
     * // Fetch the initial reply to this interaction
     * const replyMessage = await interaction.fetchReply();
     * console.log(replyMessage.content);
     *
     */
    async fetchReply(message: Snowflake | "@original" = "@original") {
      return this.webhook.fetchMessage(message);
    }

    /**
     * Edits a reply to this interaction.
     *
     * @param options The new options for the message
     * @example
     * // Edit the initial reply to this interaction
     * awiat interaction.editReply('New content')
     */
    async editReply(
      options: string | MessagePayload | InteractionEditReplyOptions
    ) {
      if (!this.deferred && !this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionNotReplied
        );
      const msg = await this.webhook.editMessage(
        (options as any).message ?? "@original",
        options as any
      );
      this.replied = true;
      return msg;
    }

    /**
     * Deletes a reply to this interaction.
     *
     * @example
     * // Delete the initial reply to this interaction
     * interaction.deleteReply()
     *   .then(console.log)
     *   .catch(console.error);
     */
    async deleteReply(message: Snowflake | "@original" = "@original") {
      if (!this.deferred && !this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionNotReplied
        );
      await this.webhook.deleteMessage(message);
    }

    /**
     * Send a follow-up message to this interaction.
     *
     * @param options The options for the reply
     */

    async followUp(
      options: { withResponse: true } & InteractionReplyOptions
    ): Promise<APIMessage>;
    async followUp(
      options:
        | string
        | (InteractionReplyOptions & {
            withResponse?: false;
          })
    ): Promise<undefined>;
    async followUp(
      options: string | (InteractionReplyOptions & { withResponse?: boolean })
    ): Promise<APIMessage | undefined> {
      if (!this.deferred && !this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionNotReplied
        );
      const msg = await this.webhook.send(options as any);
      this.replied = true;
      return msg;
    }
    async launchActivity(
      options: LaunchActivityOptions & { withResponse: true }
    ): Promise<InteractionCallbackResponse>;
    async launchActivity(
      options: LaunchActivityOptions & { withResponse?: false }
    ): Promise<undefined>;
    async launchActivity({
      withResponse,
    }: LaunchActivityOptions = {}): Promise<InteractionCallbackResponse | void> {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );

      const body = {
        type: InteractionResponseType.LaunchActivity,
      };

      if (!this.res.headersSent) {
        this.res.writeHead(200, {
          "Content-Type": "application/json",
        });
        this.res.end(JSON.stringify(body));

        this.replied = true;
        return undefined;
      } else {
        const response = await this.client.rest.post(
          Routes.interactionCallback(this.id, this.token),
          {
            body: InteractionResponseType.LaunchActivity,
            // files,
            auth: false,
            query: makeURLSearchParams({
              with_response: withResponse ?? false,
            }),
          }
        );
        this.replied = true;

        return withResponse
          ? new InteractionCallbackResponse(this.client, response)
          : undefined;
      }
    }

    // ModalBuilder|ModalComponentData|APIModalInteractionResponseCallbackData
    // I was about to code this, but there doesn't seem to be a use case for it.
    /**
     *  ⚠️ **Warning**:
     * - Firstly, consider using {@link InteractionRouter#modal} instead of this method.
     * - This method should **not** be used in serverless environments(eg. cloudflare, vercel, etc).
     * - Modals are **not intended to be dynamic**. They should come from a predefined set that you can transform if needed, but everything should be predefined. Avoid randomizing modals.
     * - For `customId`, it is highly recommended to use a **unique, non-dynamic value**.
     * - The `guildId` and `userId` from the modal submit interaction are sufficient to identify where and who submitted the modal.
     *
     * - As mentioned above, you would use this only if you have a highly dynamic modal with a unique modal ID.
     * - It internally mutates the router, and the resolved interaction will be returned if found within the given time frame otherwise, undefined.
     * - If you are considering using it, make sure the `customId` is unique for the given modal.
     *
     * Waits for a ModalSubmit interaction.
     *
     */

    // async awaitModalSubmit(options) {
    //   });
    // }
  };
}

export function ExtendedInteractionResponseMixin<
  T extends new (...args: any[]) => BaseInteraction
>(Base: T) {
  return class extends BaseInteractionResponseMixin(Base) {
    async deferUpdate(
      options: djs.InteractionDeferUpdateOptions & { withResponse: true }
    ): Promise<InteractionCallbackResponse>;
    async deferUpdate(
      options: InteractionDeferUpdateOptions & { withResponse?: false }
    ): Promise<undefined>;
    async deferUpdate(
      options: InteractionDeferUpdateOptions = {}
    ): Promise<InteractionCallbackResponse | undefined> {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );
      const body = {
        type: InteractionResponseType.DeferredMessageUpdate,
      };
      if (!this.res.headersSent) {
        this.res.writeHead(200, {
          "Content-Type": "application/json",
        });
        this.res.end(JSON.stringify(body));
        this.deferred = true;
        return undefined;
      } else {
        const response = await this.client.rest.post(
          Routes.interactionCallback(this.id, this.token),
          {
            body,
            auth: false,
            query: makeURLSearchParams({
              with_response: options.withResponse ?? false,
            }),
          }
        );
        this.deferred = true;
        return options.withResponse
          ? new InteractionCallbackResponse(this.client, response)
          : undefined;
      }
    }

    /**
     * Creates a reply to this interaction.
     * @remarks Use the withResponse option to get the interaction callback response if a response has already been sent.
     */
    async update(
      options: string | (BaseMessageOptionsWithPoll & { withResponse?: false })
    ): Promise<undefined>;
    async update(
      options: string | (BaseMessageOptionsWithPoll & { withResponse: true })
    ): Promise<InteractionCallbackResponse>;
    async update(
      options:
        | string
        // | MessagePayload (to be added)
        | (BaseMessageOptionsWithPoll & { withResponse?: boolean })
    ): Promise<InteractionCallbackResponse | undefined> {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );

      const messagePayload =
        options instanceof MessagePayload
          ? options
          : MessagePayload.create(this as any, options);

      const { body: data, files } = await messagePayload
        .resolveBody()
        .resolveFiles();
      // const { body: data } = messagePayload.resolveBody();

      const InteractonResponseObject = {
        type: InteractionResponseType.UpdateMessage,
        data,
      };

      if (!this.res.headersSent) {
        this.res.writeHead(200, {
          "Content-Type": files?.length
            ? MultipartData.getHeader()
            : "application/json",
        });
        this.res.end(
          files?.length
            ? MultipartData.buildFromMessagePayload(messagePayload)
            : JSON.stringify(InteractonResponseObject)
        );
        this.ephemeral = Boolean(data.flags & MessageFlags.Ephemeral);
        this.replied = true;
        return undefined;
      } else {
        const response = await this.client.rest.post(
          Routes.interactionCallback(this.id, this.token),
          {
            body: InteractonResponseObject,
            files,
            auth: false,
            query: makeURLSearchParams({
              with_response: (options as any).withResponse ?? false,
            }),
          }
        );
        return (options as any).withResponse && this.res.headersSent
          ? (new InteractionCallbackResponse(
              this.client,
              response as any
            ) as any)
          : undefined;
      }
    }
  };
}

export function AttachShowModalMethod<
  T extends new (...args: any[]) => BaseInteraction
>(Base: T) {
  return class extends BaseInteractionResponseMixin(Base) {
    async showModal(
      modal:
        | ModalBuilder
        | APIModalInteractionResponseCallbackData
        | djs.ModalComponentData,
      options: ShowModalOptions & { withResposne: true }
    ): Promise<undefined>;
    async showModal(
      modal:
        | ModalBuilder
        | APIModalInteractionResponseCallbackData
        | djs.ModalComponentData,
      options: ShowModalOptions & { withResponse?: false }
    ): Promise<InteractionCallbackResponse>;
    async showModal(
      modal:
        | ModalBuilder
        | APIModalInteractionResponseCallbackData
        | djs.ModalComponentData,
      options: ShowModalOptions = {}
    ) {
      if (this.deferred || this.replied)
        throw new DiscordHttpsError(
          DiscordHttpsErrorCodes.InteractionAlreadyReplied
        );

      if (!isJSONEncodable(modal)) {
        throw new Error("Modal parsing failed!");
      }

      const body = {
        type: InteractionResponseType.Modal,
        data: modal.toJSON(),
      };

      if (!this.res.headersSent) {
        this.res.writeHead(200, {
          "Content-Type": "application/json",
        });
        this.res.end(JSON.stringify(body));
        this.replied = true;
        return undefined;
      } else {
        const response = await this.client.rest.post(
          Routes.interactionCallback(this.id, this.token),
          {
            body,
            auth: false,
            query: makeURLSearchParams({
              with_response: options.withResponse ?? false,
            }),
          }
        );
        this.replied = true;

        return options.withResponse
          ? new InteractionCallbackResponse(this.client, response)
          : undefined;
      }
    }
  };
}
