import { ContextMenuInteraction } from "./Base.js";

/**
 * Represents a message context menu interaction.
 *
 */
export class UserContextMenuInteraction extends ContextMenuInteraction {
  /**
   * The message this interaction was sent from
   *
   * @type {Message|APIMessage}
   * @readonly
   */
  get targetUser() {
    return this.options.getUser("message");
  }
  get targetMember() {
    return this.options.getMember("user");
  }
}
