export type BitFieldResolvable =
  | number
  | bigint
  | BitField
  | string
  | BitFieldResolvable[];

class BitField {
  bitfield: bigint;
  static readonly BIT_ZERO = 0n;
  constructor(bit = BitField.BIT_ZERO) {
    this.bitfield = BitField.resolve(bit);
  }

  /**
   * Checks if this bitfield equals another
   */
  equals(bit: BitFieldResolvable) {
    return this.bitfield === BitField.resolve(bit);
  }

  /**
   * Checks whether the bitfield has a bit, or multiple bit.
   */
  has(bit: BitFieldResolvable) {
    bit = BitField.resolve(bit);
    return (this.bitfield & bit) === bit;
  }

  /**
   * Freezes these bits, making them immutable.
   */
  freeze() {
    return Object.freeze(this);
  }

  /**
   * Adds bits to bitfield.
   */
  add(...bits: BitFieldResolvable[]) {
    let total = BitField.BIT_ZERO;
    for (const bit of bits) {
      total |= BitField.resolve(bit);
    }
    if (Object.isFrozen(this)) return new BitField(this.bitfield | total);
    this.bitfield |= total;
    return this;
  }

  /**
   * Removes bits from bitfield.
   */

  remove(...bits: BitFieldResolvable[]) {
    let total = BitField.BIT_ZERO;
    for (const bit of bits) {
      total |= BitField.resolve(bit);
    }
    if (Object.isFrozen(this)) return new BitField(this.bitfield & ~total);
    this.bitfield &= ~total;
    return this;
  }

  toJSON() {
    return this.bitfield.toString();
  }

  valueOf() {
    return this.bitfield;
  }

  /**
   * Resolves any supported bit input to a bigint bit.
   */

  static resolve(bit: BitFieldResolvable): bigint {
    if (typeof bit === "number") {
      return BigInt(bit);
    } else if (typeof bit === "bigint") {
      return bit;
    }
    if (bit instanceof BitField) {
      return bit.bitfield;
    }

    if (Array.isArray(bit)) {
      return bit
        .map((b) => this.resolve(b))
        .reduce((accumulatedBit, currentBit) => accumulatedBit | currentBit);
    }

    if (typeof bit === "string") {
      return BigInt(bit);
    }
    throw new TypeError(`Invalid bitfield input: ${JSON.stringify(bit)}`);
  }
}

export default BitField;
