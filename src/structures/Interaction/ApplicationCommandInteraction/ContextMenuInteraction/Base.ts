// @ts-nocheck
import type {
  APIContextMenuInteraction,
  APIContextMenuInteractionData,
  APIApplicationCommandInteractionData,
  APIMessage,
} from "discord-api-types/v10";

import {
  CommandInteractionOptionResolver,
  CommandInteractionOption,
} from "../BaseOptionResolver.js";

import { CommandInteraction } from "../CommandInteractionBase.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

import type Client from "../../../../index.js";
import type { Snowflake } from "discord-api-types/v10";
import type { HttpAdapterSererResponse } from "../../../../adapter/index.js";

/**
 * Represents a context menu interaction.
 */
export class ContextMenuInteraction extends CommandInteraction {
  /**
   * The options passed to the command.
   */
  public options;
  constructor(
    client: Client,
    data: APIContextMenuInteraction,
    res: HttpAdapterSererResponse
  ) {
    super(client, data, res);

    /**
     * The target of the interaction, parsed into options
     */

    this.options = new ContextMenuCommandOptions(
      client,
      this.transformContextMenuOption(data.data),
      data.data.resolved
    );
  }
  transformContextMenuOption({
    target_id,
    resolved,
  }: APIContextMenuInteractionData) {
    const result = [];

    if (resolved.users?.[target_id]) {
      result.push(
        this._transformOption(
          {
            name: "user",
            type: ApplicationCommandOptionType.User,
            value: target_id,
          },
          resolved
        )
      );
    }

    if (resolved.messages?.[target_id]) {
      result.push({
        name: "message",
        type: "_MESSAGE",
        value: target_id,
        message: resolved.messages[target_id],
      });
    }

    return result;
  }
}

export class ContextMenuCommandOptions extends CommandInteractionOptionResolver {
  public getMessage(name: string, required = false): APIMessage | null {
    const option = this.options._getTypedOption(
      name,
      ["_MESSAGE" as any],
      ["message"],
      required
    );
    return option?.message ?? null;
  }
}
