// reference -> https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/errors/Messages.js

import { DiscordHttpsErrorCodes } from "./ErrorCode.js";

type MessageValue = string | ((...args: any[]) => string);

export const Messages: Record<DiscordHttpsErrorCodes, MessageValue> = {
  [DiscordHttpsErrorCodes.ClientInvalidOption]: (prop: string, must: string) =>
    `The ${prop} option must be ${must}`,
  [DiscordHttpsErrorCodes.ClientInvalidProvidedShards]:
    "None of the provided shards were valid.",
  [DiscordHttpsErrorCodes.ClientMissingIntents]:
    "Valid intents must be provided for the Client.",
  [DiscordHttpsErrorCodes.ClientNotReady]: (action: string) =>
    `The client needs to be logged in to ${action}.`,

  [DiscordHttpsErrorCodes.TokenInvalid]: "An invalid token was provided.",
  [DiscordHttpsErrorCodes.TokenMissing]:
    "Request to use token, but token was unavailable to the client.",
  [DiscordHttpsErrorCodes.ApplicationCommandPermissionsTokenMissing]:
    "Editing application command permissions requires an OAuth2 bearer token, but none was provided.",

  [DiscordHttpsErrorCodes.BitFieldInvalid]: (bit: unknown) =>
    `Invalid bitfield flag or number: ${bit}.`,

  [DiscordHttpsErrorCodes.ShardingNoShards]: "No shards have been spawned.",
  [DiscordHttpsErrorCodes.ShardingInProcess]: "Shards are still being spawned.",
  [DiscordHttpsErrorCodes.ShardingInvalidEvalBroadcast]:
    "Script to evaluate must be a function",
  [DiscordHttpsErrorCodes.ShardingShardNotFound]: (id: number) =>
    `Shard ${id} could not be found.`,
  [DiscordHttpsErrorCodes.ShardingAlreadySpawned]: (count: number) =>
    `Already spawned ${count} shards.`,
  [DiscordHttpsErrorCodes.ShardingProcessExists]: (id: number) =>
    `Shard ${id} already has an active process.`,
  [DiscordHttpsErrorCodes.ShardingWorkerExists]: (id: number) =>
    `Shard ${id} already has an active worker.`,
  [DiscordHttpsErrorCodes.ShardingReadyTimeout]: (id: number) =>
    `Shard ${id}'s Client took too long to become ready.`,
  [DiscordHttpsErrorCodes.ShardingReadyDisconnected]: (id: number) =>
    `Shard ${id}'s Client disconnected before becoming ready.`,
  [DiscordHttpsErrorCodes.ShardingReadyDied]: (id: number) =>
    `Shard ${id}'s process exited before its Client became ready.`,
  [DiscordHttpsErrorCodes.ShardingNoChildExists]: (id: number) =>
    `Shard ${id} has no active process or worker.`,
  [DiscordHttpsErrorCodes.ShardingShardMiscalculation]: (
    shard: number,
    guild: string,
    count: number
  ) =>
    `Calculated invalid shard ${shard} for guild ${guild} with ${count} shards.`,

  [DiscordHttpsErrorCodes.ColorRange]:
    "Color must be within the range 0 - 16777215 (0xFFFFFF).",
  [DiscordHttpsErrorCodes.ColorConvert]: (color: unknown) =>
    `Unable to convert "${color}" to a number.`,

  [DiscordHttpsErrorCodes.InviteOptionsMissingChannel]:
    "A valid guild channel must be provided when GuildScheduledEvent is EXTERNAL.",

  [DiscordHttpsErrorCodes.InteractionCollectorError]: (reason: string) =>
    `Collector received no interactions before ending with reason: ${reason}`,

  [DiscordHttpsErrorCodes.FileNotFound]: (file: string) =>
    `File could not be found: ${file}`,

  [DiscordHttpsErrorCodes.UserNoDMChannel]: "No DM Channel exists!",

  [DiscordHttpsErrorCodes.VoiceNotStageChannel]:
    "You are only allowed to do this in stage channels.",

  [DiscordHttpsErrorCodes.VoiceStateNotOwn]:
    "You cannot self-deafen/mute/request to speak on VoiceStates that do not belong to the ClientUser.",
  [DiscordHttpsErrorCodes.VoiceStateInvalidType]: (name: string) =>
    `${name} must be a boolean.`,

  [DiscordHttpsErrorCodes.ReqResourceType]:
    "The resource must be a string, Buffer or a valid file stream.",

  [DiscordHttpsErrorCodes.MessageBulkDeleteType]:
    "The messages must be an Array, Collection, or number.",
  [DiscordHttpsErrorCodes.MessageContentType]:
    "Message content must be a string.",
  [DiscordHttpsErrorCodes.MessageNonceRequired]:
    "Message nonce is required when enforceNonce is true.",
  [DiscordHttpsErrorCodes.MessageNonceType]:
    "Message nonce must be an integer or a string.",

  [DiscordHttpsErrorCodes.BanResolveId]: (ban: boolean = false) =>
    `Couldn't resolve the user id to ${ban ? "ban" : "unban"}.`,
  [DiscordHttpsErrorCodes.FetchBanResolveId]:
    "Couldn't resolve the user id to fetch the ban.",

  [DiscordHttpsErrorCodes.PruneDaysType]: "Days must be a number",

  [DiscordHttpsErrorCodes.GuildChannelResolve]:
    "Could not resolve channel to a guild channel.",
  [DiscordHttpsErrorCodes.GuildVoiceChannelResolve]:
    "Could not resolve channel to a guild voice channel.",
  [DiscordHttpsErrorCodes.GuildChannelOrphan]:
    "Could not find a parent to this guild channel.",
  [DiscordHttpsErrorCodes.GuildChannelUnowned]:
    "The fetched channel does not belong to this manager's guild.",
  [DiscordHttpsErrorCodes.GuildOwned]: "Guild is owned by the client.",
  [DiscordHttpsErrorCodes.GuildMembersTimeout]:
    "Members didn't arrive in time.",
  [DiscordHttpsErrorCodes.GuildSoundboardSoundsTimeout]:
    "Soundboard sounds didn't arrive in time.",
  [DiscordHttpsErrorCodes.GuildUncachedMe]:
    "The client user as a member of this guild is uncached.",
  [DiscordHttpsErrorCodes.ChannelNotCached]:
    "Could not find the channel where this message came from in the cache!",
  [DiscordHttpsErrorCodes.StageChannelResolve]:
    "Could not resolve channel to a stage channel.",
  [DiscordHttpsErrorCodes.GuildScheduledEventResolve]:
    "Could not resolve the guild scheduled event.",
  [DiscordHttpsErrorCodes.FetchOwnerId]: (type: string) =>
    `Couldn't resolve the ${type} ownerId to fetch the ${type} member.`,
  [DiscordHttpsErrorCodes.InvalidType]: (name, expected, an = false) =>
    `Supplied ${name} is not a${an ? "n" : ""} ${expected}.`,
  [DiscordHttpsErrorCodes.InvalidElement]: (type, name, elem) =>
    `Supplied ${type} ${name} includes an invalid element: ${elem}`,

  [DiscordHttpsErrorCodes.MessageThreadParent]:
    "The message was not sent in a guild text or announcement channel",
  [DiscordHttpsErrorCodes.MessageExistingThread]:
    "The message already has a thread",
  [DiscordHttpsErrorCodes.ThreadInvitableType]: (type) =>
    `Invitable cannot be edited on ${type}`,
  [DiscordHttpsErrorCodes.NotAThreadOfParent]:
    "Provided ThreadChannelResolvable is not a thread of the parent channel.",

  [DiscordHttpsErrorCodes.WebhookMessage]:
    "The message was not sent by a webhook.",
  [DiscordHttpsErrorCodes.WebhookTokenUnavailable]:
    "This action requires a webhook token, but none is available.",
  [DiscordHttpsErrorCodes.WebhookURLInvalid]:
    "The provided webhook URL is not valid.",
  [DiscordHttpsErrorCodes.WebhookApplication]:
    "This message webhook belongs to an application and cannot be fetched.",

  [DiscordHttpsErrorCodes.MessageReferenceMissing]:
    "The message does not reference another message",

  [DiscordHttpsErrorCodes.EmojiType]:
    "Emoji must be a string or GuildEmoji/ReactionEmoji",
  [DiscordHttpsErrorCodes.EmojiManaged]: "Emoji is managed and has no Author.",
  [DiscordHttpsErrorCodes.MissingManageGuildExpressionsPermission]: (guild) =>
    `Client must have Manage Guild Expressions permission in guild ${guild} to see emoji authors.`,

  [DiscordHttpsErrorCodes.NotGuildSoundboardSound]: (action) =>
    `Soundboard sound is a default (non-guild) soundboard sound and can't be ${action}.`,
  [DiscordHttpsErrorCodes.NotGuildSticker]:
    "Sticker is a standard (non-guild) sticker and has no author.",

  [DiscordHttpsErrorCodes.ReactionResolveUser]:
    "Couldn't resolve the user id to remove from the reaction.",

  [DiscordHttpsErrorCodes.InviteResolveCode]:
    "Could not resolve the code to fetch the invite.",
  [DiscordHttpsErrorCodes.InviteNotFound]:
    "Could not find the requested invite.",

  [DiscordHttpsErrorCodes.DeleteGroupDMChannel]:
    "Bots don't have access to Group DM Channels and cannot delete them",
  [DiscordHttpsErrorCodes.FetchGroupDMChannel]:
    "Bots don't have access to Group DM Channels and cannot fetch them",

  [DiscordHttpsErrorCodes.MemberFetchNonceLength]:
    "Nonce length must not exceed 32 characters.",

  [DiscordHttpsErrorCodes.GlobalCommandPermissions]:
    "Permissions for global commands may only be fetched or modified by providing a GuildResolvable " +
    "or from a guild's application command manager.",
  [DiscordHttpsErrorCodes.GuildUncachedEntityResolve]: (type) =>
    `Cannot resolve ${type} from an arbitrary guild, provide an id instead`,

  [DiscordHttpsErrorCodes.InteractionAlreadyReplied]:
    "The reply to this interaction has already been sent or deferred.",
  [DiscordHttpsErrorCodes.InteractionNotReplied]:
    "The reply to this interaction has not been sent or deferred.",

  [DiscordHttpsErrorCodes.CommandInteractionOptionNotFound]: (name) =>
    `Required option "${name}" not found.`,
  [DiscordHttpsErrorCodes.CommandInteractionOptionType]: (
    name,
    type,
    expected
  ) => `Option "${name}" is of type: ${type}; expected ${expected}.`,
  [DiscordHttpsErrorCodes.CommandInteractionOptionEmpty]: (name, type) =>
    `Required option "${name}" is of type: ${type}; expected a non-empty value.`,
  [DiscordHttpsErrorCodes.CommandInteractionOptionNoSubcommand]:
    "No subcommand specified for interaction.",
  [DiscordHttpsErrorCodes.CommandInteractionOptionNoSubcommandGroup]:
    "No subcommand group specified for interaction.",
  [DiscordHttpsErrorCodes.CommandInteractionOptionInvalidChannelType]: (
    name,
    type,
    expected
  ) =>
    `The type of channel of the option "${name}" is: ${type}; expected ${expected}.`,
  [DiscordHttpsErrorCodes.AutocompleteInteractionOptionNoFocusedOption]:
    "No focused option for autocomplete interaction.",
  [DiscordHttpsErrorCodes.ModalSubmitInteractionFieldNotFound]: (customId) =>
    `Required field with custom id "${customId}" not found.`,
  [DiscordHttpsErrorCodes.ModalSubmitInteractionFieldType]: (
    customId,
    type,
    expected
  ) =>
    `Field with custom id "${customId}" is of type: ${type}; expected ${expected}.`,

  [DiscordHttpsErrorCodes.InvalidMissingScopes]:
    "At least one valid scope must be provided for the invite",
  [DiscordHttpsErrorCodes.InvalidScopesWithPermissions]:
    "Permissions cannot be set without the bot scope.",

  [DiscordHttpsErrorCodes.NotImplemented]: (what, name) =>
    `Method ${what} not implemented on ${name}.`,

  [DiscordHttpsErrorCodes.SweepFilterReturn]:
    "The return value of the sweepFilter function was not false or a Function",

  [DiscordHttpsErrorCodes.GuildForumMessageRequired]:
    "You must provide a message to create a guild forum thread",

  [DiscordHttpsErrorCodes.EntitlementCreateInvalidOwner]:
    "You must provide either a guild or a user to create an entitlement, but not both",

  [DiscordHttpsErrorCodes.BulkBanUsersOptionEmpty]:
    'Option "users" array or collection is empty',

  [DiscordHttpsErrorCodes.PollAlreadyExpired]: "This poll has already expired.",

  [DiscordHttpsErrorCodes.PermissionOverwritesTypeMandatory]:
    '"overwrite.type" is mandatory if "overwrite.id" is a Snowflake',
  [DiscordHttpsErrorCodes.PermissionOverwritesTypeMismatch]: (expected) =>
    `"overwrite.id" is a ${expected.toLowerCase()} object, ` +
    `but "overwrite.type" is defined and not equal to OverwriteType.${expected}`,
};
