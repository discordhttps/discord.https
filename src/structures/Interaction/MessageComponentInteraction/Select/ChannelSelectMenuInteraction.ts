import { Collection } from "@discordjs/collection";
import {
  APIMessageComponentInteraction,
  ComponentType,
  APIMessageChannelSelectInteractionData,
  Snowflake,
  APIInteractionDataResolvedChannel,
} from "discord-api-types/v10";
import { MessageComponentInteraction } from "../Base.js";
import Client from "../../../../index.js";
import { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 */
export class ChannelSelectMenuInteraction extends MessageComponentInteraction {
  /**
   * An array of the selected user ids
   */
  values: Snowflake[];

  /**
   * Collection of the selected channels
   */
  channels = new Collection<Snowflake, APIInteractionDataResolvedChannel>();

  constructor(
    client: Client,
    data: APIMessageComponentInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data, res);
    const { resolved, values } =
      data.data as APIMessageChannelSelectInteractionData;
    this.values = values ?? [];

    for (const channel of Object.values(resolved?.channels ?? {})) {
      this.channels.set(channel.id, channel);
    }
  }
}
