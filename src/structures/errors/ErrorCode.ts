// reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/errors/ErrorCodes.js

/**
 * Enum of DiscordHttps error codes.
 */

export enum DiscordHttpsErrorCodes {
  ClientInvalidOption = "ClientInvalidOption",
  ClientInvalidProvidedShards = "ClientInvalidProvidedShards",
  ClientMissingIntents = "ClientMissingIntents",
  ClientNotReady = "ClientNotReady",

  TokenInvalid = "TokenInvalid",
  TokenMissing = "TokenMissing",
  ApplicationCommandPermissionsTokenMissing = "ApplicationCommandPermissionsTokenMissing",

  BitFieldInvalid = "BitFieldInvalid",

  ShardingNoShards = "ShardingNoShards",
  ShardingInProcess = "ShardingInProcess",
  ShardingInvalidEvalBroadcast = "ShardingInvalidEvalBroadcast",
  ShardingShardNotFound = "ShardingShardNotFound",
  ShardingAlreadySpawned = "ShardingAlreadySpawned",
  ShardingProcessExists = "ShardingProcessExists",
  ShardingWorkerExists = "ShardingWorkerExists",
  ShardingReadyTimeout = "ShardingReadyTimeout",
  ShardingReadyDisconnected = "ShardingReadyDisconnected",
  ShardingReadyDied = "ShardingReadyDied",
  ShardingNoChildExists = "ShardingNoChildExists",
  ShardingShardMiscalculation = "ShardingShardMiscalculation",

  ColorRange = "ColorRange",
  ColorConvert = "ColorConvert",

  InviteOptionsMissingChannel = "InviteOptionsMissingChannel",

  InteractionCollectorError = "InteractionCollectorError",

  FileNotFound = "FileNotFound",

  UserNoDMChannel = "UserNoDMChannel",

  VoiceNotStageChannel = "VoiceNotStageChannel",
  VoiceStateNotOwn = "VoiceStateNotOwn",
  VoiceStateInvalidType = "VoiceStateInvalidType",

  ReqResourceType = "ReqResourceType",

  MessageBulkDeleteType = "MessageBulkDeleteType",
  MessageContentType = "MessageContentType",
  MessageNonceRequired = "MessageNonceRequired",
  MessageNonceType = "MessageNonceType",

  BanResolveId = "BanResolveId",
  FetchBanResolveId = "FetchBanResolveId",

  PruneDaysType = "PruneDaysType",

  GuildChannelResolve = "GuildChannelResolve",
  GuildVoiceChannelResolve = "GuildVoiceChannelResolve",
  GuildChannelOrphan = "GuildChannelOrphan",
  GuildChannelUnowned = "GuildChannelUnowned",
  GuildOwned = "GuildOwned",
  GuildMembersTimeout = "GuildMembersTimeout",
  GuildSoundboardSoundsTimeout = "GuildSoundboardSoundsTimeout",
  GuildUncachedMe = "GuildUncachedMe",
  ChannelNotCached = "ChannelNotCached",
  StageChannelResolve = "StageChannelResolve",
  GuildScheduledEventResolve = "GuildScheduledEventResolve",
  FetchOwnerId = "FetchOwnerId",

  InvalidType = "InvalidType",
  InvalidElement = "InvalidElement",

  MessageThreadParent = "MessageThreadParent",
  MessageExistingThread = "MessageExistingThread",
  ThreadInvitableType = "ThreadInvitableType",
  NotAThreadOfParent = "NotAThreadOfParent",

  WebhookMessage = "WebhookMessage",
  WebhookTokenUnavailable = "WebhookTokenUnavailable",
  WebhookURLInvalid = "WebhookURLInvalid",
  WebhookApplication = "WebhookApplication",

  MessageReferenceMissing = "MessageReferenceMissing",

  EmojiType = "EmojiType",
  EmojiManaged = "EmojiManaged",
  MissingManageGuildExpressionsPermission = "MissingManageGuildExpressionsPermission",

  NotGuildSoundboardSound = "NotGuildSoundboardSound",
  NotGuildSticker = "NotGuildSticker",

  ReactionResolveUser = "ReactionResolveUser",

  InviteResolveCode = "InviteResolveCode",
  InviteNotFound = "InviteNotFound",

  DeleteGroupDMChannel = "DeleteGroupDMChannel",
  FetchGroupDMChannel = "FetchGroupDMChannel",

  MemberFetchNonceLength = "MemberFetchNonceLength",

  GlobalCommandPermissions = "GlobalCommandPermissions",
  GuildUncachedEntityResolve = "GuildUncachedEntityResolve",

  InteractionAlreadyReplied = "InteractionAlreadyReplied",
  InteractionNotReplied = "InteractionNotReplied",

  CommandInteractionOptionNotFound = "CommandInteractionOptionNotFound",
  CommandInteractionOptionType = "CommandInteractionOptionType",
  CommandInteractionOptionEmpty = "CommandInteractionOptionEmpty",
  CommandInteractionOptionNoSubcommand = "CommandInteractionOptionNoSubcommand",
  CommandInteractionOptionNoSubcommandGroup = "CommandInteractionOptionNoSubcommandGroup",
  CommandInteractionOptionInvalidChannelType = "CommandInteractionOptionInvalidChannelType",
  AutocompleteInteractionOptionNoFocusedOption = "AutocompleteInteractionOptionNoFocusedOption",

  ModalSubmitInteractionFieldNotFound = "ModalSubmitInteractionFieldNotFound",
  ModalSubmitInteractionFieldType = "ModalSubmitInteractionFieldType",

  InvalidMissingScopes = "InvalidMissingScopes",
  InvalidScopesWithPermissions = "InvalidScopesWithPermissions",

  NotImplemented = "NotImplemented",

  SweepFilterReturn = "SweepFilterReturn",

  GuildForumMessageRequired = "GuildForumMessageRequired",

  EntitlementCreateInvalidOwner = "EntitlementCreateInvalidOwner",

  BulkBanUsersOptionEmpty = "BulkBanUsersOptionEmpty",

  PollAlreadyExpired = "PollAlreadyExpired",

  PermissionOverwritesTypeMandatory = "PermissionOverwritesTypeMandatory",
  PermissionOverwritesTypeMismatch = "PermissionOverwritesTypeMismatch",
}
