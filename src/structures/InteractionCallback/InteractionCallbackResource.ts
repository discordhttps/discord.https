// reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/InteractionCallbackResource.js

import { InteractionResponseType } from "discord-api-types/v10";

import type {
  APIMessage,
  RESTAPIInteractionCallbackActivityInstanceResource,
} from "discord.js";

import type Client from "../../index.js";

/**
 * Represents the resource that was created by the interaction response.
 */
export class InteractionCallbackResource {
  /**
   * The client that instantiated this
   */
  readonly client!: Client;

  /**
   * The interaction callback type
   *
   */
  readonly type: InteractionResponseType;

  /**
   * Represents the Activity launched by this interaction
   *
   */
  activityInstance: RESTAPIInteractionCallbackActivityInstanceResource | null;

  /**
   * The message created by the interaction
   *
   */
  readonly message: APIMessage | null;

  constructor(
    client: Client,
    data: {
      type: number;
      activity_instance?: { id: string } | null;
      message?: APIMessage;
    }
  ) {
    Object.defineProperty(this, "client", { value: client });

    this.type = data.type;
    this.activityInstance = data.activity_instance ?? null;
    this.message = data.message ?? null;
  }
}
