// reference => https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/errors/DJSError.js

import { DiscordHttpsErrorCodes } from "./ErrorCode.js";
import { Messages } from "./ErrorMessage.js";

/**
 * Extend an error of some sort into a DiscordHttpsError.
 *
 * @param {Error} Base Base error to extend
 * @ignore
 */
function makeDiscordHttpsError<T extends new (...a: any[]) => Error>(Base: T) {
  return class DiscordHttpsError extends Base {
    public readonly code: DiscordHttpsErrorCodes;
    // A mixin class must have a constructor with a single rest parameter of type 'any[]'
    constructor(...[code, ...args]: any[]) {
      super(formatMessage(code as DiscordHttpsErrorCodes, args));
      this.code = code;
      Error.captureStackTrace?.(this, DiscordHttpsError);
    }

    override get name(): string {
      return `${super.name} [${this.code}]`;
    }
  };
}

/**
 * Format the message for an error.
 *
 * @param code The error code
 * @param args Arguments to pass for util format or as function args
 * @returns Formatted string
 * @ignore
 */

function formatMessage(code: DiscordHttpsErrorCodes, args: any[]): string {
  if (!(code in DiscordHttpsErrorCodes)) {
    throw new Error("Error code must be a valid DiscordHttpsErrorCodes");
  }
  const msg = Messages[code];
  if (!msg) {
    throw new Error(`No message associated with error code: ${code}.`);
  }
  if (typeof msg === "function") return msg(...args);
  if (!args?.length) return msg;
  args.unshift(msg);
  return String(...args);
}

export const DiscordHttpsError = makeDiscordHttpsError(Error);
export const DiscordjsTypeError = makeDiscordHttpsError(TypeError);
export const DiscordjsRangeError = makeDiscordHttpsError(RangeError);
