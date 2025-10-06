import { ContextMenuInteraction } from "./Base.js";

import type {
  APIUser,
  APIInteractionDataResolvedGuildMember,
} from "discord-api-types/v10";

/**
 * Represents a message context menu interaction.
 *
 */

export class UserContextMenuInteraction extends ContextMenuInteraction {
  /**
   * The message this interaction was sent from
   */
  get targetUser() {
    return this.options.getUser("user") as APIUser;
  }
  get targetMember() {
    return this.options.getMember(
      "user"
    ) as APIInteractionDataResolvedGuildMember;
  }
}
