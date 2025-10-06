import { ContextMenuInteraction } from "./Base.js";

import type { APIMessage } from "discord-api-types/v10";

/**
 * Represents a message context menu interaction.
 *
 */

export class MessageContextMenuInteraction extends ContextMenuInteraction {
  /**
   * The message this interaction was sent from
   */
  get targetMessage() {
    return this.options.getMessage("message") as APIMessage;
  }
}
