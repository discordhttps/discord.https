import { Collection } from "@discordjs/collection";
import {
  APIUser,
  APIGuildMember,
  APIMessageComponentInteraction,
  ComponentType,
  Snowflake,
  APIRole,
  APIMessageRoleSelectInteractionData,
} from "discord-api-types/v10";
import { MessageComponentInteraction } from "../Base.js";
import Client from "../../../../index.js";
import { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 */
export class RoleSelectMenuInteraction extends MessageComponentInteraction {
  /**
   * An array of the selected user ids
   */
  values: Snowflake[];

  /**
   * Collection of the selected users
   */
  roles = new Collection<Snowflake, APIRole>();

  constructor(
    client: Client,
    data: APIMessageComponentInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data, res);
    const { resolved, values } =
      data.data as APIMessageRoleSelectInteractionData;

    this.values = values ?? [];

    for (const role of Object.values(resolved?.roles ?? {})) {
      this.roles.set(role.id, role);
    }
  }
}
