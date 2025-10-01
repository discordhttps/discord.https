//reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/InteractionCallback.js

import { DiscordSnowflake } from "@sapphire/snowflake";

import type { Snowflake, InteractionType } from "discord-api-types/v10";

import type Client from "../../index.js";

/**
 * Represents an interaction callback response from Discord
 */
export class InteractionCallback {
  /**
   * The client that instantiated this.
   */
  readonly client!: Client;

  /**
   * The id of the original interaction response
   *
   */
  readonly id: Snowflake;

  /**
   * The type of the original interaction
   *
   */
  readonly type: number;

  /**
   * The instance id of the Activity if one was launched or joined
   *
   */
  readonly activityInstanceId: string | null;

  /**
   * The id of the message that was created by the interaction
   *
   */
  readonly responseMessageId: string | null;

  /**
   * Whether the message is in a loading state
   *
   */
  readonly responseMessageLoading: boolean | null;

  /**
   * Whether the response message was ephemeral
   */
  readonly responseMessageEphemeral: boolean | null;

  constructor(
    client: Client,
    data: {
      readonly id: Snowflake;
      readonly type: InteractionType;
      readonly activity_instance_id?: string | null;
      readonly response_message_id?: Snowflake | null;
      readonly response_message_loading?: boolean | null;
      readonly response_message_ephemeral?: boolean | null;
    }
  ) {
    Object.defineProperty(this, "client", { value: client });
    this.id = data.id;
    this.type = data.type;
    this.activityInstanceId = data.activity_instance_id ?? null;
    this.responseMessageId = data.response_message_id ?? null;
    this.responseMessageLoading = data.response_message_loading ?? null;
    this.responseMessageEphemeral = data.response_message_ephemeral ?? null;
  }

  /**
   * The timestamp the original interaction was created at
   *
   * @type {number}
   * @readonly
   */
  get createdTimestamp(): number {
    return DiscordSnowflake.timestampFrom(this.id);
  }

  /**
   * The time the original interaction was created at
   *
   * @type {Date}
   * @readonly
   */
  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }
}
