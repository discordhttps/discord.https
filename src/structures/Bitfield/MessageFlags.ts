//reference => https://github.com/discordjs/discord.js/blob/14.22.1/packages/discord.js/src/util/MessageFlagsBitField.js

import { MessageFlags } from "discord-api-types/v10";
import BitField from "./base.js";
import { NonReverseEnumFlag } from "../utils/type.js";

/**
 * Data structure that makes it easy to interact with a Discord message flags bitfield.
 */

export default class MessageFlagsBitField extends BitField<
  NonReverseEnumFlag<typeof MessageFlags>
> {
  /**
   * Numeric message flags.
   * @memberof MessageFlagsBitField
   */
  static Flags = MessageFlags as NonReverseEnumFlag<typeof MessageFlags>;
}
// Maybe, should keep it for documentation… not planning to have a doc anytime soon

/**
 * @name MessageFlagsBitField
 * @kind constructor
 * @memberof MessageFlagsBitField
 * @param {BitFieldResolvable} [bits=0] Bit(s) to read from
 */

/**
 * Data that can be resolved to give a message flags bit field. This can be:
 * * A string (see {@link MessageFlagsBitField.Flags})
 * * A message flag
 * * An instance of {@link MessageFlagsBitField}
 * * An array of `MessageFlagsResolvable`
 * @typedef {string|number|MessageFlagsBitField|MessageFlagsResolvable[]} MessageFlagsResolvable
 */

/**
 * Bitfield of the packed bits
 * @type {number}
 * @name MessageFlagsBitField#bitfield
 */
