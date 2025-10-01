import { Collection } from "@discordjs/collection";
import {
  APIUser,
  APIMessageComponentInteraction,
  ComponentType,
  APIMessageUserSelectInteractionData,
  Snowflake,
  APIInteractionDataResolvedGuildMember,
} from "discord-api-types/v10";
import {MessageComponentInteraction} from "../Base.js";
import Client from "../../../../index.js";
import { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 */
export class UserSelectMenuInteraction extends MessageComponentInteraction {
  /**
   * An array of the selected user ids
   */
  values: Snowflake[];

  /**
   * Collection of the selected users
   */
  users = new Collection<Snowflake, APIUser>();

  /**
   * Collection of the selected members
   */
  members = new Collection<Snowflake, APIInteractionDataResolvedGuildMember>();

  constructor(
    client: Client,
    data: APIMessageComponentInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data, res);
    const { resolved, values } =
      data.data as APIMessageUserSelectInteractionData;

    this.values = values ?? [];

    for (const user of Object.values(resolved?.users ?? {})) {
      this.users.set(user.id, user);
    }

    for (const [id, member] of Object.entries(resolved?.members ?? {})) {
      this.members.set(id, member);
    }
  }
}
