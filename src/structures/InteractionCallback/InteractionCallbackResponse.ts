//reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/InteractionCallbackResponse.js

import { InteractionCallback } from "./InteractionCallback.js";
import { InteractionCallbackResource } from "./InteractionCallbackResource.js";

import type Client from "../../index.js";

/**
 * Represents an interaction's response
 */
export class InteractionCallbackResponse {
  /**
   * The client that instantiated this
   */
  readonly client!: Client;

  /**
   * The interaction object associated with the interaction callback response
   *
   */
  readonly interaction: InteractionCallback;

  /**
   * The resource that was created by the interaction response
   *
   * @type {?InteractionCallbackResource}
   */
  readonly resource: InteractionCallbackResource | null;

  constructor(
    client: Client,
    data: {
      interaction: ConstructorParameters<typeof InteractionCallback>[1];
      resource?:
        | ConstructorParameters<typeof InteractionCallbackResource>[1]
        | null;
    }
  ) {
    Object.defineProperty(this, "client", { value: client });

    /**
     * The interaction object associated with the interaction callback response
     */

    this.interaction = new InteractionCallback(client, data.interaction);

    /**
     * The resource that was created by the interaction response
     */
    this.resource = data.resource
      ? new InteractionCallbackResource(client, data.resource)
      : null;
  }
}
