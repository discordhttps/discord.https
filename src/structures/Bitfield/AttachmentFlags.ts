/* eslint-disable jsdoc/check-values */

import { AttachmentFlags } from "discord-api-types/v10";
import { NonReverseEnumFlag } from "../utils/type.js";

import { BitField } from "./base.js";

/**
 * Data structure that makes it easy to interact with a Discord attachment flags bitfield.
 *
 */
export class AttachmentFlagsBitField extends BitField<
  NonReverseEnumFlag<typeof AttachmentFlags>
> {
  /**
   * Numeric attachment flags.
   */
  static Flags = AttachmentFlags as NonReverseEnumFlag<typeof AttachmentFlags>;
}
