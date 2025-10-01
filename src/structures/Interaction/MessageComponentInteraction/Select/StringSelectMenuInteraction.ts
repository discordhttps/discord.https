import {
  APIMessageComponentInteraction,
  ComponentType,
  APIMessageStringSelectInteractionData,
} from "discord-api-types/v10";
import {MessageComponentInteraction} from "../Base.js";
import Client from "../../../../index.js";
import { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 * Represents a {@link ComponentType.UserSelect} select menu interaction.
 */
export class StringSelectMenuInteraction extends MessageComponentInteraction {
  /**
   * The values selected
   */
  values: string[];

  constructor(
    client: Client,
    data: APIMessageComponentInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data, res);
    const { values } = data.data as APIMessageStringSelectInteractionData;

    this.values = values ?? [];
  }
}
