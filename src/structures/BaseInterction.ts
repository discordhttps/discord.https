"use strict";

// import { Collection } from "@discordjs/collection";
import { DiscordSnowflake } from "@sapphire/snowflake";
import {
  InteractionType,
  ApplicationCommandType,
  ComponentType,
  Snowflake,
  Locale,
  APIInteractionGuildMember,
  APIUser,
  APIPingInteraction,
  APIBaseInteraction,
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
} from "discord-api-types/v10";

import { AutocompleteInteraction } from "./AutocompleteInteraction.js";
import ChatInputCommandInteraction from "./ChatInputCommandInteraction.js";

import { REST } from "@discordjs/rest";
import PermissionsBitField from "./util/Bitfield.js";

export type DiscordHttpsAPIInteraction =
  | APIApplicationCommandAutocompleteInteraction
  | APIApplicationCommandInteraction
  | APIMessageComponentInteraction
  | APIModalSubmitInteraction;

export type DiscordHttpsInteraction = ChatInputCommandInteraction;
/**
 * Represents an interaction.
 * @abstract
 */

class BaseInteraction {
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
  // public entitlements: Collection<Snowflake, APIEntitlement>;

  // /**
  //  * Mapping of integration contexts this interaction was authorized for.
  //  * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object}
  //  */
  // public authorizingIntegrationOwners: APIAuthorizingIntegrationOwnersMap;

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
  constructor(client: REST, data: DiscordHttpsAPIInteraction) {
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
    ).freeze();
    this.memberPermissions = data.member?.permissions
      ? new PermissionsBitField(
          PermissionsBitField.resolve(data.member?.permissions)
        ).freeze()
      : null;
    this.locale = "locale" in data ? (data.locale as Locale) : Locale.EnglishUS;
    this.guildLocale = data.guild_locale ?? null;
    // this.entitlements = data.entitlements.reduce(
    //   (coll, entitlement) =>
    //     coll.set(
    //       entitlement.id,
    //       this.client.application.entitlements._add(entitlement)
    //     ),
    //   new Collection()
    // );
    // this.authorizingIntegrationOwners = data.authorizing_integration_owners;
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

  // !!TODO
  // /**
  //  * The channel this interaction was sent in
  //  * @readonly
  //  */
  // get channel() {
  //   return this.client.channels.cache.get(this.channelId) ?? null;
  // }

  // !!TODO
  // /**
  //  * The guild this interaction was sent in
  //  * @type {?Guild}
  //  * @readonly
  //  */
  // get guild() {
  //   return this.client.guilds.cache.get(this.guildId) ?? null;
  // }

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

  // /**
  //  * Indicates whether this interaction is an {@link AutocompleteInteraction}
  //  * @returns {boolean}
  //  */
  // isAutocomplete(): this is AutocompleteInteraction {
  //   return this.type === InteractionType.ApplicationCommandAutocomplete;
  // }

  // /**
  //  * Indicates whether this interaction is a {@link CommandInteraction}
  //  * @returns {boolean}
  //  */
  // isCommand() {
  //   return this.type === InteractionType.ApplicationCommand;
  // }

  // /**
  //  * Indicates whether this interaction is a {@link ChatInputCommandInteraction}.
  //  * @returns {boolean}
  //  */
  // isChatInputCommand() {
  //   return (
  //     this.type === InteractionType.ApplicationCommand &&
  //     this.commandType === ApplicationCommandType.ChatInput
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link ContextMenuCommandInteraction}
  //  * @returns {boolean}
  //  */
  // isContextMenuCommand() {
  //   return (
  //     this.type === InteractionType.ApplicationCommand &&
  //     [ApplicationCommandType.User, ApplicationCommandType.Message].includes(
  //       this.commandType
  //     )
  //   );
  // }

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

  // /**
  //  * Indicates whether this interaction is a {@link MessageComponentInteraction}
  //  * @returns {boolean}
  //  */
  // isMessageComponent() {
  //   return this.type === InteractionType.MessageComponent;
  // }

  // /**
  //  * Indicates whether this interaction is a {@link ModalSubmitInteraction}
  //  * @returns {boolean}
  //  */
  // isModalSubmit() {
  //   return this.type === InteractionType.ModalSubmit;
  // }

  // /**
  //  * Indicates whether this interaction is a {@link UserContextMenuCommandInteraction}
  //  * @returns {boolean}
  //  */
  // isUserContextMenuCommand() {
  //   return (
  //     this.isContextMenuCommand() &&
  //     this.commandType === ApplicationCommandType.User
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link MessageContextMenuCommandInteraction}
  //  * @returns {boolean}
  //  */
  // isMessageContextMenuCommand() {
  //   return (
  //     this.isContextMenuCommand() &&
  //     this.commandType === ApplicationCommandType.Message
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link ButtonInteraction}.
  //  * @returns {boolean}
  //  */
  // isButton() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.Button
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link StringSelectMenuInteraction}.
  //  * @returns {boolean}
  //  * @deprecated Use {@link BaseInteraction#isStringSelectMenu} instead.
  //  */
  // isSelectMenu() {
  //   return this.isStringSelectMenu();
  // }

  // /**
  //  * Indicates whether this interaction is a select menu of any known type.
  //  * @returns {boolean}
  //  */
  // isAnySelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     SelectMenuTypes.includes(this.componentType)
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link StringSelectMenuInteraction}.
  //  * @returns {boolean}
  //  */
  // isStringSelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.StringSelect
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link UserSelectMenuInteraction}
  //  * @returns {boolean}
  //  */
  // isUserSelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.UserSelect
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link RoleSelectMenuInteraction}
  //  * @returns {boolean}
  //  */
  // isRoleSelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.RoleSelect
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link ChannelSelectMenuInteraction}
  //  * @returns {boolean}
  //  */
  // isChannelSelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.ChannelSelect
  //   );
  // }

  // /**
  //  * Indicates whether this interaction is a {@link MentionableSelectMenuInteraction}
  //  * @returns {boolean}
  //  */
  // isMentionableSelectMenu() {
  //   return (
  //     this.type === InteractionType.MessageComponent &&
  //     this.componentType === ComponentType.MentionableSelect
  //   );
  // }

  // /**
  //  * Indicates whether this interaction can be replied to.
  //  * @returns {boolean}
  //  */
  // isRepliable() {
  //   return ![
  //     InteractionType.Ping,
  //     InteractionType.ApplicationCommandAutocomplete,
  //   ].includes(this.type);
  // }
}

export default BaseInteraction;
