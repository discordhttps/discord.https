"use strict";

import { findComponentByCustomId } from "../../utils/Util.js";
import { BaseInteraction } from "../BaseInterction.js";
import { InteractionWebhook } from "../../InteractionWebhook.js";
import type { Snowflake } from "discord-api-types/v10";
import type Client from "../../../index.js";
import {
  ExtendedInteractionResponseMixin,
  AttachShowModalMethod,
} from "../InteractionReponseMixin.js";
import type {
  APIComponentInMessageActionRow,
  APIMessageComponentInteraction,
  APIMessage,
} from "discord-api-types/v10";

import type { MessageActionRowComponent } from "discord.js";

import type { HttpAdapterSererResponse } from "../../../adapter/index.js";

/**
 * Represents a message component interaction.
 */
export class MessageComponentInteraction extends ExtendedInteractionResponseMixin(
  AttachShowModalMethod(BaseInteraction)
) {
  /** The message to which the component was attached */
  public readonly message: APIMessage;

  /** The custom id of the component which was interacted with */
  public readonly customId: string;

  /** The type of component which was interacted with */
  public readonly componentType: number;

  /** Whether the reply to this interaction has been deferred */
  public deferred: boolean = false;

  /** Whether the reply to this interaction is ephemeral */
  public ephemeral: boolean | null = null;

  /** Whether this interaction has already been replied to */
  public replied: boolean = false;

  /** An associated interaction webhook, can be used to further interact with this interaction */
  public readonly webhook: InteractionWebhook;

  constructor(
    client: Client,
    data: APIMessageComponentInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data);

    this.message = data.message;
    this.customId = data.data.custom_id;
    this.componentType = data.data.component_type;

    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );

    Object.defineProperty(this, "res", { value: res });
  }

  /**
   * The component which was interacted with
   */
  public get component():
    | MessageActionRowComponent
    | APIComponentInMessageActionRow {
    // There is type error the djs so, gotta have to use any
    return findComponentByCustomId(
      this.message.components as any,
      this.customId
    ) as any;
  }
}
