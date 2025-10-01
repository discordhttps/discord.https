import {
  DiscordHttpsTypeError,
  DiscordHttpsErrorCodes,
} from "../../errors/index.js";
import { Attachment } from "../../Attachment/Attachment.js";
import { CommandInteractionOptionResolver } from "./BaseOptionResolver.js";
import { CommandInteraction } from "./CommandInteractionBase.js";

import { ApplicationCommandOptionType } from "discord-api-types/v10";

import type {
  APIRole,
  APIUser,
  ChannelType,
  APIChatInputApplicationCommandInteraction,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
} from "discord-api-types/v10";

import type Client from "../../../index.js";
import type { HttpAdapterSererResponse } from "../../../adapter/index.js";

/**
 * Represents a chat input command interaction.
 */
export class ChatInputCommandInteraction extends CommandInteraction {
  /**
   * The options passed to the command.
   */
  public options;
  /**
   * @internal
   *
   * @param client - The client instance that received this interaction.
   * @param data - The raw interaction data from Discord.
   */
  constructor(
    client: Client,
    data: APIChatInputApplicationCommandInteraction,
    res: HttpAdapterSererResponse
  ) {
    super(client, data, res);
    this.options = new ChatInputCommandOptions(
      this.client,
      data.data.options?.map((option: any) =>
        this._transformOption(option, data.data.resolved)
      ) ?? [],
      data.data.resolved
    );
  }
}

export class ChatInputCommandOptions extends CommandInteractionOptionResolver {
  /**
   * Gets the selected subcommand.
   *
   * @param required  Whether to throw an error if there is no subcommand.
   * @returns The name of the selected subcommand, or null if not set and not required.
   */
  public getSubcommand(required = true): string | null {
    if (required && !this._subcommand) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.CommandInteractionOptionNoSubcommand
      );
    }
    return this._subcommand;
  }

  /**
   * Gets the selected subcommand group.
   *
   * @param required Whether to throw an error if there is no subcommand group.
   * @returns The name of the selected subcommand group, or null if not set and not required.
   */
  public getSubcommandGroup(required = false): string | null {
    if (required && !this._group) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.CommandInteractionOptionNoSubcommandGroup
      );
    }
    return this._group;
  }

  /**
   * Gets a boolean option value.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if the option is not found. Defaults to `false`.
   * @returns The boolean value, or `null` if not set.
   *
   * @example
   * ```ts
   * <interaction>.getBoolean("admin");
   * ```
   */
  public getBoolean(name: string, required = false): boolean | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Boolean],
      ["value"],
      required
    );
    return (option?.value as any) ?? null;
  }

  /**
   * Gets a string option value.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if the option is not found. Defaults to `false`.
   * @returns The string value, or `null` if not set.
   *
   * @example
   * ```ts
   * <interaction>.getString("username");
   * ```
   */

  public getString(name: string, required = false): string | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.String],
      ["value"],
      required
    );
    return (option?.value as any) ?? null;
  }

  /**
   * Gets an integer option value.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if the option is not found. Defaults to `false`.
   * @returns The integer value, or `null` if not set.
   *
   * @example
   * ```ts
   * <interaction>.getInteger("age");
   * ```
   */
  public getInteger(name: string, required = false): number | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Integer],
      ["value"],
      required
    );
    return (option?.value as any) ?? null;
  }

  /**
   * Gets a number option value.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not found. Defaults to `false`.
   * @returns The number value, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getNumber("score");
   * ```
   */
  public getNumber(name: string, required = false): number | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Number],
      ["value"],
      required
    );
    return (option?.value as any) ?? null;
  }

  /**
   * Gets a user option.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not found. Defaults to `false`.
   * @returns The resolved user, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getUser("user");
   * ```
   */

  /**
   * Gets a role option.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not found. Defaults to `false`.
   * @returns The resolved role, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getRole("role");
   * ```
   */
  public getRole(name: string, required = false): APIRole | null {
    const option = this._getTypedOption(
      name,
      [
        ApplicationCommandOptionType.Role,
        ApplicationCommandOptionType.Mentionable,
      ],
      ["role"],
      required
    );
    return (option?.role as any) ?? null;
  }

  /**
   * Gets an attachment option.
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not present. Defaults to `false`.
   * @returns The resolved attachment, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getMentionable("role");
   * ```
   *
   */
  public getAttachment(name: string, required = false): Attachment | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Attachment],
      ["attachment"],
      required
    );
    return (option?.attachment as any) ?? null;
  }

  /**
   * Gets a mentionable option (user, member, or role).
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not found. Defaults to `false`.
   * @returns The resolved user, member, or role, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getMentionable("role");
   * ```
   */
  public getMentionable(
    name: string,
    required = false
  ): APIUser | APIInteractionDataResolvedGuildMember | APIRole | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Mentionable],
      ["user", "member", "role"],
      required
    );
    return option?.member ?? option?.user ?? option?.role ?? null;
  }

  /**
   * Gets a channel option.
   *
   * @param name - The name of the option.
   * @param required - Whether to throw an error if not found. Defaults to `false`.
   * @param channelTypes - Allowed channel types.
   * @returns The resolved channel, or `null`.
   *
   * @example
   * ```ts
   * <interaction>.getChannel("channel", true, [ChannelType.GuildText]);
   * ```
   */
  public getChannel(
    name: string,
    required = false,
    channelTypes: ChannelType[] = []
  ):
    | APIInteractionDataResolvedChannel
    | APIInteractionDataResolvedChannel
    | null {
    const option = this._getTypedOption(
      name,
      [ApplicationCommandOptionType.Channel],
      ["channel"],
      required
    );
    const channel = option?.channel ?? null;

    if (
      channel &&
      channelTypes.length > 0 &&
      !channelTypes.includes(channel.type)
    ) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.CommandInteractionOptionInvalidChannelType,
        name,
        channel.type,
        channelTypes.join(", ")
      );
    }

    return channel;
  }
}
