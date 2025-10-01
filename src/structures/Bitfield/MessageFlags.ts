//reference => https://github.com/discordjs/discord.js/blob/14.22.1/packages/discord.js/src/util/MessageFlagsBitField.js

import { MessageFlags } from "discord-api-types/v10";
import { BitField } from "./base.js";
import { NonReverseEnumFlag } from "../utils/type.js";

/**
 * Data structure that makes it easy to interact with a Discord message flags bitfield.
 */

export class MessageFlagsBitField extends BitField<
  NonReverseEnumFlag<typeof MessageFlags>
> {
  /**
   * Numeric message flags.
   */
  static Flags = MessageFlags as NonReverseEnumFlag<typeof MessageFlags>;
}
