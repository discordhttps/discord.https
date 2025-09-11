//@ts-nocheck
// reference => https://github.com/discordhttps/discord.https/blob/main/src/structures/util/Bitfield.ts

import {
  DiscordHttpsRangeError,
  DiscordHttpsErrorCodes,
} from "../errors/index.js";

export type BitFieldResolvable<T extends number | bigint = number> =
  | T
  | string
  | BitField<T>
  | BitFieldResolvable<T>[];

/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export default abstract class BitField<
  TEnum extends Record<string, number | bigint> = Record<string, number>,
  TValue = TEnum[keyof TEnum]
> {
  /**
   * Numeric bitfield flags.
   */
  static Flags: Record<string, number | bigint> = {};

  /**
   * Default bit value
   */
  static DefaultBit: number | bigint = 0;

  /**
   * Bitfield of the packed bits
   */
  bitfield: TValue;

  /**
   * Bit(s) to read from
   */
  constructor(
    bits: BitFieldResolvable<TValue> = new.target.DefaultBit as number
  ) {
    this.bitfield = (
      new.target as typeof BitField & {
        resolve(bits: BitFieldResolvable<TValue>): TValue;
      }
    ).resolve(bits);
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   * @param {BitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  any(bit: BitFieldResolvable): boolean {
    return (
      (this.bitfield & (this.constructor as typeof BitField).resolve(bit)) !==
      (this.constructor as typeof BitField).DefaultBit
    );
  }

  /**
   * Checks if this bitfield equals another
   * @param {BitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  equals(bit: BitFieldResolvable): boolean {
    return this.bitfield === (this.constructor as typeof BitField).resolve(bit);
  }

  /**
   * Checks whether the bitfield has a bit, or multiple bits.
   * @param {BitFieldResolvable} bit Bit(s) to check for
   * @returns {boolean}
   */
  has(bit: BitFieldResolvable): boolean {
    bit = (this.constructor as typeof BitField).resolve(bit);
    return (this.bitfield & bit) === bit;
  }

  /**
   * Gets all given bits that are missing from the bitfield.
   * @param {BitFieldResolvable} bits Bit(s) to check for
   * @param {...*} hasParams Additional parameters for the has method, if any
   * @returns {string[]}
   */
  missing(bits: BitFieldResolvable, ...hasParams: any[]): string[] {
    return new (this.constructor as typeof BitField)(bits)
      .remove(this)
      .toArray(...hasParams);
  }

  /**
   * Freezes these bits, making them immutable.
   */
  freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  /**
   * Adds bits to these ones.
   */
  add(...bits) {
    let total = (this.constructor as typeof BitField).DefaultBit;
    for (const bit of bits) {
      total |= (this.constructor as typeof BitField).resolve(bit);
    }
    if (Object.isFrozen(this))
      return new (this.constructor as typeof BitField)(this.bitfield | total);
    this.bitfield |= total;
    return this;
  }

  /**
   * Removes bits from these.
   */
  remove(...bits: BitFieldResolvable[]): this {
    let total = (this.constructor as typeof BitField).DefaultBit;
    for (const bit of bits) {
      total |= (this.constructor as typeof BitField).resolve(bit);
    }
    if (Object.isFrozen(this))
      return new (this.constructor as typeof BitField)(this.bitfield & ~total);
    this.bitfield &= ~total;
    return this;
  }
  /**
   * Gets an object mapping field names to a {@link boolean} indicating whether the
   * bit is available.
   * @param {...*} hasParams Additional parameters for the has method, if any
   * @returns {Object}
   */
  serialize(...hasParams: any[]): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries(
      (this.constructor as typeof BitField).Flags
    )) {
      if (isNaN(flag)) serialized[flag] = this.has(bit, ...hasParams);
    }
    return serialized;
  }

  /**
   * Gets an {@link Array} of bitfield names based on the bits available.
   */
  toArray(...hasParams: any[]): string[] {
    return [...this[Symbol.iterator](...hasParams)];
  }

  toJSON(): number | string {
    return typeof this.bitfield === "number"
      ? this.bitfield
      : this.bitfield.toString();
  }

  valueOf(): number | bigint {
    return this.bitfield;
  }

  *[Symbol.iterator](...hasParams: any[]): IterableIterator<string> {
    for (const bitName of Object.keys(
      (this.constructor as typeof BitField).Flags
    )) {
      if (isNaN(bitName) && this.has(bitName, ...hasParams)) yield bitName;
    }
  }

  /**
   * Data that can be resolved to give a bitfield. This can be:
   * * A bit number (this can be a number literal or a value taken from {@link BitField.Flags})
   * * A string bit number
   * * An instance of BitField
   * * An Array of BitFieldResolvable
   */
  static resolve(
    this: typeof BitField,
    bit: BitFieldResolvable = this.DefaultBit
  ): number | bigint {
    const { DefaultBit } = this;
    if (typeof bit === typeof DefaultBit && bit >= DefaultBit) return bit;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit
        .map((b) => this.resolve(b))
        .reduce((prev, curr) => prev | curr, DefaultBit);
    if (typeof bit === "string") {
      if (!isNaN(Number(bit)))
        return typeof DefaultBit === "bigint" ? BigInt(bit) : Number(bit);
      if (this.Flags[bit] !== undefined) return this.Flags[bit];
    }
    throw new DiscordHttpsRangeError(
      DiscordHttpsErrorCodes.BitFieldInvalid,
      bit
    );
  }
}
