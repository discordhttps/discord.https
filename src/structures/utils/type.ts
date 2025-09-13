/**
 * Ignore Enums reverse mapping from enum flags
 */
export type NonReverseEnumFlag<
  T extends Record<string | number, string | number | bigint>
> = {
  [K in keyof T as K extends number ? never : K]: T[K];
};
