import {IdType} from './shared';

/**
 * Makes object partial by some its fields
 */
export type PartialBy<T, K extends keyof T> =
  Omit<T, K>
  & Partial<Pick<T, K>>;

/**
 * Extracts IdType from type
 */
export type ExtractIdType<T> = Extract<T, IdType>;

/**
 * PartialBy for union types
 */
export type UnionPartialBy<U, Keys extends string> = U extends infer E
  ? PartialBy<E, Keys & keyof E>
  : never;

/**
 * Pick for union types
 */
export type UnionPick<U, Keys extends string> = U extends infer E
  ? Pick<E, Keys & keyof E>
  : never;
