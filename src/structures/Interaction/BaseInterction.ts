"use strict";
import { BitField as PermissionsBitField } from "../Bitfield/base.js";

import { DiscordSnowflake } from "@sapphire/snowflake";

import {
  InteractionType,
  ApplicationCommandType,
  ComponentType,
} from "discord-api-types/v10";
import type {
  Locale,
  APIUser,
  Snowflake,
  APIEntitlement,
  APIContextMenuInteraction,
  APIModalSubmitInteraction,
  APIInteractionGuildMember,
  APIMessageComponentInteraction,
  APIApplicationCommandInteraction,
  APIAuthorizingIntegrationOwnersMap,
  APIApplicationCommandAutocompleteInteraction,
} from "discord-api-types/v10";

import type Client from "../../index.js";

/**
 * Represents a raw Discord interaction's field.
 *
 * This union type includes all possible interaction types that can be
 * received from Discord's HTTP API:
 **/

export type DiscordHttpsAPIInteraction =
  | APIApplicationCommandAutocompleteInteraction
  | APIApplicationCommandInteraction
  | APIMessageComponentInteraction
  | APIModalSubmitInteraction
  | APIContextMenuInteraction;

// Context
import type { UserContextMenuInteraction } from "./ApplicationCommandInteraction/ContextMenuInteraction/UserContext.js";
import type { MessageContextMenuInteraction } from "./ApplicationCommandInteraction/ContextMenuInteraction/MessageContext.js";

// slash
import type { ChatInputCommandInteraction } from "../Interaction/ApplicationCommandInteraction/ChatInputCommandInteraction.js";

// Autocomplete
import type { AutoCompleteInteraction } from "../Interaction/AutocompleteInteraction/AutocompleteInteraction.js";

// ModalSubmit
import type { ModalSubmitInteraction } from "../Interaction/ModalSubmitInteraction/ModalSubmitInteraction.js";

// Select
import type { UserSelectMenuInteraction } from "../Interaction/MessageComponentInteraction/Select/UserSelectComponent.js";
import type { RoleSelectMenuInteraction } from "../Interaction/MessageComponentInteraction/Select/RoleSelectMenuInteraction.js";
import type { ChannelSelectMenuInteraction } from "../Interaction/MessageComponentInteraction/Select/ChannelSelectMenuInteraction.js";
import type { MentionableSelectMenuInteraction } from "../Interaction/MessageComponentInteraction/Select/MentionableSelectMenuInteraction.js";
import type { StringSelectMenuInteraction } from "../Interaction/MessageComponentInteraction/Select/StringSelectMenuInteraction.js";

// Button
import type { ButtonInteraction } from "../Interaction/MessageComponentInteraction/ButtonInteraction.js";

// Interaction Base
import type { CommandInteraction as ApplicationCommandInteraction } from "../Interaction/ApplicationCommandInteraction/CommandInteractionBase.js";
import type { MessageComponentInteraction } from "../Interaction/MessageComponentInteraction/Base.js";
import type { ContextMenuInteraction } from "./ApplicationCommandInteraction/ContextMenuInteraction/Base.js";

/**
 * Represents a layer provided by `discord.https` over the raw API,
 * offering additional utilities.
 *
 * This type wraps a raw interaction with helper methods and convenience features for easier usage.
 */
export type DiscordHttpsInteraction =
  | ChatInputCommandInteraction
  | AutoCompleteInteraction
  | MessageContextMenuInteraction
  | UserContextMenuInteraction
  | ModalSubmitInteraction
  | UserSelectMenuInteraction
  | RoleSelectMenuInteraction
  | ChannelSelectMenuInteraction
  | MentionableSelectMenuInteraction
  | StringSelectMenuInteraction
  | ButtonInteraction;

/**
 * Represents an interaction.
 * @abstract
 */

export class BaseInteraction {
  /**
   * The interaction's type.
   */
  public type: InteractionType;

  /**
   * The interaction's unique ID.
   */
  public id: Snowflake;

  /**
   * The ID of the application (bot) this interaction is for.
   */
  public applicationId: Snowflake;

  /**
   * The ID of the channel this interaction was sent in.
   */
  public channelId: Snowflake | null;

  /**
   * The ID of the guild this interaction was sent in (if applicable).
   */
  public guildId: Snowflake | null;

  /**
   * The user who invoked this interaction.
   */
  public user: APIUser;

  /**
   * The guild member who invoked this interaction (if in a guild).
   */
  public member: APIInteractionGuildMember | null;

  /**
   * The interaction protocol version.
   */
  public version: number;

  /**
   * The permissions the application (bot) has in the interaction's channel.
   */
  public appPermissions: Readonly<PermissionsBitField>;

  /**
   * The permissions the invoking member has in the interaction's channel.
   */
  public memberPermissions: Readonly<PermissionsBitField> | null;

  /**
   * The locale of the user invoking the interaction (e.g., "en-US").
   */
  public locale: Locale;

  /**
   * The preferred locale of the guild, if the interaction was in a guild.
   */
  public guildLocale: Locale | null;

  // !!TODO
  // /**
  //  * Entitlements (e.g., premium SKU access) associated with the user.
  //  */
  public entitlements: APIEntitlement[];

  // /**
  //  * Mapping of integration contexts this interaction was authorized for.
  //  * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object}
  //  */
  public authorizingIntegrationOwners: APIAuthorizingIntegrationOwnersMap;

  /**
   * The context in which this interaction was triggered (e.g., direct message, command, etc.).
   */
  public context: number | null;

  /**
   * Maximum attachment size allowed for this interaction (in bytes).
   */
  public attachmentSizeLimit: number;

  /**
   * The client instance associated with this interaction.
   * (Injected from REST in constructor; should point to your bot client)
   */
  public readonly client: any;

  /**
   * The interaction token used for responding.
   */
  public readonly token!: string;
  constructor(client: Client, data: DiscordHttpsAPIInteraction) {
    this.type = data.type;
    this.id = data.id;
    this.applicationId = data.application_id;
    this.channelId = data.channel?.id ?? null;
    this.guildId = data.guild_id ?? null;
    this.user = data.user ?? data.member!.user;
    this.member = data.member ?? null;
    this.version = data.version;
    Object.defineProperty(this, "token", { value: data.token });
    this.appPermissions = new PermissionsBitField(
      PermissionsBitField.resolve(data.app_permissions)
    ).freeze() as any;
    this.memberPermissions = (
      data.member?.permissions
        ? new PermissionsBitField(
            PermissionsBitField.resolve(data.member?.permissions)
          ).freeze()
        : null
    ) as any;
    this.locale = data.locale;
    this.guildLocale = data.guild_locale ?? null;
    this.entitlements = data.entitlements;
    this.authorizingIntegrationOwners = data.authorizing_integration_owners;
    this.context = data.context ?? null;
    this.attachmentSizeLimit = data.attachment_size_limit;
  }
  /**
   * The timestamp the interaction was created at
   * @readonly
   */
  get createdTimestamp(): Readonly<number> {
    return DiscordSnowflake.timestampFrom(this.id);
  }

  /**
   * The time the interaction was created at
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Indicates whether this interaction is received from a guild.
   */
  inGuild() {
    return Boolean(this.guildId && this.member);
  }
  // !!TODO
  // /**
  //  * Indicates whether this interaction is received from a cached guild.
  //  * @returns {boolean}
  //  */
  // inCachedGuild() {
  //   return Boolean(this.guild && this.member);
  // }

  // !!TODO
  // /**
  //  * Indicates whether or not this interaction is received from an uncached guild.
  //  * @returns {boolean}
  //  */
  // inRawGuild() {
  //   return Boolean(this.guildId && !this.guild && this.member);
  // }

  /**
   * Indicates whether this interaction is an {@link AutoCompleteInteraction}
   * @returns {boolean}
   */
  isAutocomplete(): this is AutoCompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  /**
   * Indicates whether this interaction is a {@link ChatInputCommandInteraction}
   */
  isCommand(): this is ChatInputCommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }

  /**
   * Indicates whether this interaction is a {@link ChatInputCommandInteraction}.
   * @returns {boolean}
   */
  isChatInputCommand(): this is ChatInputCommandInteraction {
    return (
      this.type === InteractionType.ApplicationCommand &&
      // this.commandType will be mutated by Command Interaction
      (this as any).commandType === ApplicationCommandType.ChatInput
    );
  }

  /**
   * Indicates whether this interaction is a {@link ContextMenuInteraction}
   */
  isContextMenuCommand(): this is ContextMenuInteraction {
    return (
      this.type === InteractionType.ApplicationCommand &&
      [ApplicationCommandType.User, ApplicationCommandType.Message].includes(
        (this as any).commandType
      )
    );
  }

  // /**
  //  * Indicates whether this interaction is a {@link PrimaryEntryPointCommandInteraction}
  //  * @returns {boolean}
  //  */
  // isPrimaryEntryPointCommand() {
  //   return (
  //     this.type === InteractionType.ApplicationCommand &&
  //     this.commandType === ApplicationCommandType.PrimaryEntryPoint
  //   );
  // }

  /**
   * Indicates whether this interaction is a {@link MessageComponentInteraction}
   */
  isMessageComponent(): this is MessageComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }

  /**
   * Indicates whether this interaction is a {@link ModalSubmitInteraction}
   */
  isModalSubmit(): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }

  /**
   * Indicates whether this interaction is a {@link UserContextMenuInteraction}
   */
  isUserContextMenuCommand(): this is UserContextMenuInteraction {
    return (
      this.isContextMenuCommand() &&
      (this as any).commandType === ApplicationCommandType.User
    );
  }

  /**
   * Indicates whether this interaction is a {@link MessageContextMenuInteraction}
   */
  isMessageContextMenuCommand(): this is MessageContextMenuInteraction {
    return (
      this.isContextMenuCommand() &&
      (this as any).commandType === ApplicationCommandType.Message
    );
  }

  /**
   * Indicates whether this interaction is a {@link ButtonInteraction}.
   */
  isButton(): this is ButtonInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.Button
    );
  }

  /**
   * Indicates whether this interaction is a select menu of any known type.
   *
   */
  isSelectMenu(): this is
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | StringSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | MentionableSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      [
        ComponentType.StringSelect,
        ComponentType.UserSelect,
        ComponentType.RoleSelect,
        ComponentType.MentionableSelect,
        ComponentType.ChannelSelect,
      ].includes((this as any).componentType)
    );
  }

  /**
   * Indicates whether this interaction is a {@link StringSelectMenuInteraction}.
   */
  isStringSelectMenu(): this is StringSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.StringSelect
    );
  }

  /**
   * Indicates whether this interaction is a {@link UserSelectMenuInteraction}
   */
  isUserSelectMenu(): this is UserSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.UserSelect
    );
  }

  /**
   * Indicates whether this interaction is a {@link RoleSelectMenuInteraction}
   */
  isRoleSelectMenu(): this is RoleSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.RoleSelect
    );
  }

  /**
   * Indicates whether this interaction is a {@link ChannelSelectMenuInteraction}
   */
  isChannelSelectMenu(): this is ChannelSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.ChannelSelect
    );
  }

  /**
   * Indicates whether this interaction is a {@link MentionableSelectMenuInteraction}
   */
  isMentionableSelectMenu(): this is MentionableSelectMenuInteraction {
    return (
      this.type === InteractionType.MessageComponent &&
      (this as any).componentType === ComponentType.MentionableSelect
    );
  }

  // /**
  //  * Indicates whether this interaction can be replied to.
  //  */
  // isRepliable() {
  //   return ![
  //     InteractionType.Ping,
  //     InteractionType.ApplicationCommandAutocomplete,
  //   ].includes(this.type);
  // }
}
