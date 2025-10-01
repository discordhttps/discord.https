import { Collection } from "@discordjs/collection";
import {
  APIUser,
  APIGuildMember,
  APIMessageComponentInteraction,
  ComponentType,
  Snowflake,
  APIMessageMentionableSelectInteractionData,
  APIInteractionDataResolvedGuildMember,
  APIRole,
} from "discord-api-types/v10";
import {MessageComponentInteraction} from "../Base.js";
import Client from "../../../../index.js";

import { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 *
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 */
export class MentionableSelectMenuInteraction extends MessageComponentInteraction {
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

  /**
   * Collection of the selected roles
   *
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
      data.data as APIMessageMentionableSelectInteractionData;
    const { members, users, roles } = resolved ?? {};

    this.values = values ?? [];

    if (members) {
      for (const [id, member] of Object.entries(members)) {
        this.members.set(id, member);
      }
    }
    if (users) {
      for (const user of Object.values(users)) {
        this.users.set(user.id, this.client.users._add(user));
      }
    }

    if (roles) {
      for (const role of Object.values(roles)) {
        this.roles.set(role.id, role);
      }
    }
  }
}
