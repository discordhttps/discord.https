import {
  DiscordHttpsTypeError,
  DiscordHttpsErrorCodes,
} from "../../errors/index.js";
import { Attachment } from "../../Attachment/Attachment.js";
import { transformResolved } from "../../utils/Util.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

import type {
  APIRole,
  APIUser,
  APIMessage,
  APIInteractionDataResolved,
  APIUserInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessageApplicationCommandInteractionDataResolved,
} from "discord-api-types/v10";
import type Client from "../../../index.js";

/**
 * Represents an option of a received command interaction.
 */
export interface CommandInteractionOption {
  /**
   * The name of the option.
   *
   * @example
   * <interaction>.name
   */
  name: string;

  /**
   * The type of the option.
   *
   * @example
   * <interaction>.type
   */
  type: ApplicationCommandOptionType;

  /**
   * The resolved channel for this option, if applicable.
   *
   * @example
   * <interaction>.channel
   */
  channel?: APIInteractionDataResolvedChannel;

  /**
   * The value of the option. Can be string, number, or boolean depending on the option type.
   *
   * @example
   * <interaction>.value
   */
  value?: string | number | boolean;

  /**
   * The resolved message for this option, if applicable.
   *
   * @example
   * <interaction>.message
   */
  message?: APIMessage;

  /**
   * Additional options if this option is a subcommand or subcommand group.
   *
   * @example
   * <interaction>.options
   */
  options?: CommandInteractionOption[];

  /**
   * The resolved user for this option, if applicable.
   *
   * @example
   * <interaction>.user
   */
  user?: APIUser;

  /**
   * The resolved guild member for this option, if applicable.
   *
   * @example
   * <interaction>.member
   */
  member?: APIInteractionDataResolvedGuildMember;

  /**
   * The resolved role for this option, if applicable.
   *
   * @example
   * <interaction>.role
   */
  role?: APIRole;

  /**
   * The resolved attachment for this option, if applicable.
   *
   * @example
   * <interaction>.attachment
   */
  attachment?: Attachment;
}

/**
 * A resolver for command interaction options.
 */
export class CommandInteractionOptionResolver {
  /**
   * @internal
   * @hidden
   *
   * The name of the subcommand group.
   */
  _group: string | null = null;

  /**
   * @internal
   * @hidden
   *
   * The name of the subcommand.
   */
  _subcommand: string | null = null;

  /**
   * The bottom-level options for the interaction.
   * If there is a subcommand (or subcommand and group), this is the options for the subcommand.
   */
  _hoistedOptions: CommandInteractionOption[];

  public readonly data!: CommandInteractionOption[];

  /**
   * The resolved data from the interaction (users, members, roles, channels, messages).
   */
  public resolved!: ReturnType<typeof transformResolved>;
  constructor(
    public readonly client: Client,
    options: CommandInteractionOption[],
    resolved?:
      | APIInteractionDataResolved
      | APIMessageApplicationCommandInteractionDataResolved
      | APIUserInteractionDataResolved
  ) {
    /**
     * The client that instantiated this.
     */
    Object.defineProperty(this, "client", { value: client });

    Object.defineProperty(this, "resolved", {
      value: transformResolved(resolved),
    });

    this._hoistedOptions = [...options];

    // Hoist subcommand group if present
    if (
      this._hoistedOptions[0]?.type ===
      ApplicationCommandOptionType.SubcommandGroup
    ) {
      this._group = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }

    // Hoist subcommand if present
    if (
      this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand
    ) {
      this._subcommand = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }

    Object.defineProperty(this, "data", { value: Object.freeze([...options]) });
    Object.defineProperty(this, "resolved", {
      value: resolved ? Object.freeze(resolved) : null,
    });
  }

  /**
   * Gets an option by its name.
   * @param name The name of the option.
   * @param required Whether to throw if the option is not found.
   * @returns The option, or null if not found.
   */
  public get(name: string, required = false): CommandInteractionOption | null {
    const option = this._hoistedOptions.find((opt) => opt.name === name);
    if (!option) {
      if (required)
        throw new DiscordHttpsTypeError(
          DiscordHttpsErrorCodes.CommandInteractionOptionNotFound,
          name
        );
      return null;
    }
    return option;
  }

  /**
   * Gets an option by name, enforcing type and required properties.
   * @private
   */

  _getTypedOption<T extends keyof CommandInteractionOption>(
    name: string,
    allowedTypes: ApplicationCommandOptionType[],
    properties: T[],
    required: boolean
  ): CommandInteractionOption | null {
    const option = this.get(name, required);
    if (!option) return null;
    if (!allowedTypes.includes(option.type)) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.CommandInteractionOptionType,
        name,
        option.type,
        allowedTypes.join(", ")
      );
    }

    if (
      required &&
      properties.every(
        (prop) => option[prop] === null || option[prop] === undefined
      )
    ) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.CommandInteractionOptionEmpty,
        name,
        option.type
      );
    }

    return option;
  }
  public getUser(name: string, required = false): APIUser | null {
    const option = this._getTypedOption(
      name,
      [
        ApplicationCommandOptionType.User,
        ApplicationCommandOptionType.Mentionable,
      ],
      ["user"],
      required
    );
    return (option?.user as any) ?? null;
  }

  /**
   * Gets a member option.
   *
   * @param name - The name of the option.
   * @returns The resolved member, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getMember("user");
   * ```
   */

  public getMember(name: string): APIInteractionDataResolvedGuildMember | null {
    const option = this._getTypedOption(
      name,
      [
        ApplicationCommandOptionType.User,
        ApplicationCommandOptionType.Mentionable,
      ],
      ["member"],
      false
    );
    return (option?.member as any) ?? null;
  }
}
