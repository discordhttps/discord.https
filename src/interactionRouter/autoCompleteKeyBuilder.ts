import {
  ApplicationCommandOptionType,
  APIApplicationCommandOption,
  _AddUndefinedToPossiblyUndefinedPropertiesOfInterface,
  APIApplicationCommandAutocompleteInteraction,
} from "discord-api-types/v10";

import type { CommandDefinitionType } from "./internal.js";

/**
 * A modified interaction option used while resolving an
 * {@link APIApplicationCommandAutocompleteInteraction}.
 */

export interface APIApplicationCommandAutocompleteInteractionModified {
  /** Type of the option (string, number, boolean, etc.). */
  type: ApplicationCommandOptionType;

  /** Name of the option. */
  name: string;

  /** Current value of the option if provided. */
  value?: string | number | boolean; // The value of the option (can be string, number, or boolean)

  /** Whether this option is currently focused. */
  focused?: boolean;

  /** Nested options for subcommands or groups. */
  options?: APIApplicationCommandOption[]; // Nested options (for subcommands, etc.)
}

/**
 * Builder utility for creating **autocomplete keys** used by the router’s
 * `autocomplete()` method.
 *
 * This class helps you construct a colon-delimited key that uniquely identifies
 * the path to an option with `autocomplete` enabled in a slash command,
 * including subcommands and subcommand groups.
 *
 * Simply, This class is used to manage and resolve the paths for autocomplete keys in Discord application commands.
 *
 * @example
 *
 * const weather = router.command(
 *   (builder) =>
 *     builder
 *       .setName("weather")
 *       .setDescription("Query weather information!")
 *       .addStringOption(option =>
 *         option
 *           .setName("city")
 *           .setDescription("City to get the weather for")
 *           .setAutocomplete(true) // Enable autocomplete for this option
 *       ),
 *   handler
 * );
 * router.autocomplete(weather.getAutoCompleteKey("city"), autocompleteMiddleware);
 */

class AutoCompleteKeyBuilder {
  /** @internal Internal list of the path segments collected so far. */
  private path: string[] = []; // Array to store path segment

  /**
   * Internal pointer to the command definition as we traverse it.
   * @internal
   */
  __internal_CommandDefinition:
    | CommandDefinitionType
    | _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<
        APIApplicationCommandOption[] | undefined
      >
    | _AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption>;

  /**
   * @internal
   * Create a new builder from a command definition.
   * @param CommandDefinition The root slash-command definition.
   */
  constructor(CommandDefinition: CommandDefinitionType) {
    this.__internal_CommandDefinition = CommandDefinition;
  }

  /**
   * Clones the current AutoCompleteKeyBuilder.
   * Throws an error if the path has already been partially built.
   *
   * @example
   *```ts
   * const weatherCommandAutoCompleteKey = router.command(
   *(builder) =>
   * builder
   *  .setName("weather")
   * .setDescription("Query weather information!")
   * // First autocomplete option
   *.addStringOption((option) =>
   *  option
   *    .setName("city")
   *   .setDescription("City to get the weather for")
   *  .setAutocomplete(true)
   *)
   * //Second autocomplete option
   *.addStringOption((option) =>
   *  option
   *   .setName("unit")
   *          .setDescription("Unit for temperature")
   *         .setAutocomplete(true)
   *    ),
   *(interaction) => handler
   *
   *const cityAutoCompleteKey = weatherCommandAutoCompleteKey.clone();
   *const unitAutoCompleteKey = weatherCommandAutoCompleteKey.clone();
   *
   * router.autocomplete(cityAutoCompleteKey.getAutoCompleteKey("city"), autocompleteMiddleware);
   * router.autocomplete(unitAutoCompleteKey.getAutoCompleteKey("unit"), autocompleteMiddleware2);
   *```
   */

  public clone() {
    if (this.path.length > 1)
      throw new Error(
        "[AutoCompleteKeyBuilder - Discord.http] Can't clone, after method has been used."
      );
    return new AutoCompleteKeyBuilder(this.__internal_CommandDefinition as any);
  }

  /**
   * Get an autocomplete key for router.
   *
   * @param name The option name.
   * @returns This builder instance for chaining.
   * 
   *
   * @example
   ```ts
   * const weatherCommandAutoCompleteKey = router.command(
   *(builder) =>
   * builder
   *  .setName("weather")
   * .setDescription("Query weather information!")
   *.addStringOption((option) =>
   *  option
   *    .setName("city")
   *   .setDescription("City to get the weather for")
   *  .setAutocomplete(true)
   *)
   *
   * router.autocomplete(weatherCommandAutoCompleteKey.getAutocompleteKey("city"), autocompleteMiddleware);
   * ```
  */

  public getAutocompleteKey(name: string) {
    this.validate(
      name,
      ApplicationCommandOptionType.String,
      ApplicationCommandOptionType.Number,
      ApplicationCommandOptionType.Integer
    );
    this.path.push(name);
    return this;
  }

  /**
   * Get a subcommand for an autocomplete key from a slash command.
   * 
   * @param name Subcommand name.
   * @returns This builder instance for chaining.
   * 
   * @example
   * ```ts
   *const musicCommand = router.command(
   *(builder) =>
   *   builder
   *    .setName("music")
   *   .setDescription("Music related commands")
   *  .addSubcommand((sub) =>
   *   sub
   *    .setName("play")
   *   .setDescription("Play a song")
   *  .addStringOption((option) =>
   *   option
   *    .setName("song")
   *   .setDescription("Song name")
   *  .setAutocomplete(true)
   *)
   *), commandMiddleware);

   * const MusicCommandAutoCompleteKey = musicCommand.getSubCommand("play").getAutocompleteKey("song");
   *
   * router.autocomplete(MusicCommandAutoCompleteKey, handler)
   * ```
   */

  public getSubCommand(name: string) {
    this.validate(name, ApplicationCommandOptionType.Subcommand);
    this.path.push(name);
    return this;
  }

  /**
   *
   * Get a subcommandgroup for an autocomplete key from a slash command.
   *
   * @example
   * ```ts
   * const adminCommand = router.command(
   *   (builder) =>
   *     builder
   *       .setName("admin")
   *       .setDescription("Admin utilities")
   *       .addSubcommandGroup((group) =>
   *         group
   *           .setName("user")
   *           .setDescription("User-related commands")
   *           .addSubcommand((sub) =>
   *             sub
   *               .setName("ban")
   *               .setDescription("Ban a user")
   *               .addStringOption((option) =>
   *                 option
   *                   .setName("reason")
   *                   .setDescription("Reason for banning")
   *                   .setAutocomplete(true)
   *               )
   *           )
   *       ),
   *   commandHandler
   * );
   *
   * router.autocomplete(
   *   adminCommand
   *     .getSubCommandGroup("user")
   *     .getSubCommand("ban")
   *     .getAutocompleteKey("reason"), AutoCompleteHandler
   * );
   * ```
   */

  public getSubCommandGroup(name: string) {
    this.validate(name, ApplicationCommandOptionType.SubcommandGroup);
    this.path.push(name);
    return this;
  }

  /**
   * @internal
   * Validates if a given key exists within the current command definition and is of the correct type.
   */
  private validate(key: string, ...keyType: ApplicationCommandOptionType[]) {
    if (
      !this.__internal_CommandDefinition ||
      !("options" in this.__internal_CommandDefinition)
    )
      throw new Error(`Invalid key ${key}`);

    const currentOption = this.__internal_CommandDefinition.options?.find(
      (option_) => option_.name === key && keyType.includes(option_.type)
    );
    if (!currentOption) throw new Error(`Invalid key ${key}`);

    this.__internal_CommandDefinition = currentOption;
  }

  /**
   * Resolve an autocomplete key to its colon-delimited string form.
   *
   * Accepts either an {@link AutoCompleteKeyBuilder} instance
   * or a raw {@link APIApplicationCommandAutocompleteInteraction}.
   *
   * @internal
   */
  static _resolve(
    resolvable:
      | AutoCompleteKeyBuilder
      | APIApplicationCommandAutocompleteInteraction
  ) {
    if (resolvable instanceof AutoCompleteKeyBuilder)
      return resolvable.path.join(":");
    else {
      return this.__internal_buildAutoCompleteKey(
        resolvable.data.options as any
      );
    }
  }

  /**
   * @internal
   * Returns the a autocomplete key using name upto focused option.
   */
  static __internal_buildAutoCompleteKey(
    options: APIApplicationCommandAutocompleteInteractionModified[],
    path = ""
  ): string {
    for (const option of options) {
      // If the option is focused, return the full path
      if (option.focused) {
        return path ? `${path}:${option.name}` : option.name;
      }

      if (option.options && option.options.length > 0) {
        const nestedPath = this.__internal_buildAutoCompleteKey(
          option.options,
          path ? `${path}:${option.name}` : option.name
        );
        if (nestedPath) {
          return nestedPath;
        }
      }
    }
    throw Error("Autocomplete event was fired without any options.");
  }
}

export default AutoCompleteKeyBuilder;
