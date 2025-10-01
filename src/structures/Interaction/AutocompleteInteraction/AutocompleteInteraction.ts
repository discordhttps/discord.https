import {
  DiscordHttpsError,
  DiscordHttpsErrorCodes,
} from "../../errors/index.js";
import { BaseInteraction } from "../BaseInterction.js";
import { InteractionResponseType } from "discord-api-types/v10";
import { APIApplicationCommandAutocompleteInteractionModified } from "../../../interactionRouter/autoCompleteKeyBuilder.js";

import type {
  Snowflake,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  APIApplicationCommandOptionChoice,
  APIApplicationCommandAutocompleteInteraction,
} from "discord-api-types/v10";
import type { HttpAdapterSererResponse } from "../../../adapter/index.js";

/**
 * Represents an autocomplete interaction.
 *
 * @extends BaseInteraction
 */
export class AutoCompleteInteraction extends BaseInteraction {
  /**
   * The invoked application command's id.
   */
  public readonly commandId: Snowflake;

  /**
   * The invoked application command's name.
   */
  public readonly commandName: string;

  /**
   * The invoked application command's type.
   */
  public readonly commandType: ApplicationCommandType;

  /**
   * The id of the guild the invoked application command is registered to,
   * or `null` if not in a guild.
   */
  public readonly commandGuildId: Snowflake | null;

  /**
   * Whether this interaction has already received a response.
   */
  public responded: boolean;

  readonly res!: HttpAdapterSererResponse;

  private readonly options!: APIApplicationCommandAutocompleteInteractionModified[];

  constructor(
    client: any,
    data: APIApplicationCommandAutocompleteInteraction,
    res: HttpAdapterSererResponse
  ) {
    super(client, data);
    this.commandId = data.data.id;
    this.commandName = data.data.name;
    this.commandType = data.data.type;
    this.commandGuildId = data.data.guild_id ?? null;
    this.responded = false;
    Object.defineProperty(this, "options", { value: data.data.options });
    Object.defineProperty(this, "res", { value: res });
  }

  /**
   * Sends results for the autocomplete of this interaction.
   *
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#autocomplete | Discord Documentation}
   * @param options - The options for the autocomplete.
   * @example
   *
   * ```ts
   * // Respond to autocomplete interaction
   * await interaction.respond([
   *   {
   *     name: 'Option 1',
   *     value: 'option1',
   *   },
   * ]);
   * console.log('Successfully responded to the autocomplete interaction');
   * ```
   */
  public async respond(
    options: APIApplicationCommandOptionChoice[]
  ): Promise<void> {
    if (this.responded)
      throw new DiscordHttpsError(
        DiscordHttpsErrorCodes.InteractionAlreadyReplied
      );

    this.res.writeHead(200, {
      "Content-Type": "application/json",
    });

    this.res.end(
      JSON.stringify({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: options,
        },
      })
    );
    this.responded = true;
  }

  public getFocused(): {
    name: string;
    type:
      | ApplicationCommandOptionType.String
      | ApplicationCommandOptionType.Integer
      | ApplicationCommandOptionType.Number;
    value: string;
  } {
    for (const option of this.options) {
      // If the option is focused, return the full path
      if (option.focused) {
        return {
          name: option.name,
          type: option.type as any,
          value: String(option.value!),
        };
      }

      if (option.options && option.options.length > 0) {
        const value = this.getFocused();
        if (value) {
          return {
            name: option.name,
            type: option.type as any,
            value: String(option.value!),
          };
        }
      }
    }
    throw Error("Autocomplete event was fired without any options.");
  }
}
