import { type RequiredKeys } from 'typelevel-ts';
import { type runtimeType } from './Codec.js';

export const addSlash = (s: string) => (s.startsWith('/') ? s : `/${s}`);

export type DecodedPropsType<P> =
  P extends Record<string, any> ? { [k in RequiredKeys<P>]: runtimeType<P[k]> } : never;

export type KnownErrorStatus<W> = undefined extends W
  ? undefined
  : W extends Record<infer K, any>
    ? K
    : undefined;

export type KnownErrorBody<W> = undefined extends W
  ? undefined
  : W extends Record<any, infer V>
    ? V
    : undefined;
