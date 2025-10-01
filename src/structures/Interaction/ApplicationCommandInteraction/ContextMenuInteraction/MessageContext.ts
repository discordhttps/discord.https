import type {
  APIContextMenuInteraction,
  APIContextMenuInteractionData,
  APIApplicationCommandInteractionData,
  APIMessage,
} from "discord-api-types/v10";
import { ContextMenuInteraction } from "./Base.js";

/**
 * Represents a message context menu interaction.
 *
 */
export class MessageContextMenuInteraction extends ContextMenuInteraction {
  /**
   * The message this interaction was sent from
   */
  get targetMessage() {
    return this.options.getMessage("message");
  }
}
