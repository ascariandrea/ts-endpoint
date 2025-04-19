import * as E from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import { NumberFromString } from 'io-ts-types/lib/NumberFromString.js';
import { assertType, test } from 'vitest';
import {
  type decodeType,
  type InferCodec,
  type InferRecordCodec,
  type RecordCodecSerialized,
  type runtimeType,
  type serializedType,
} from '../Codec.js';

test('Codec', () => {
  const codec = t.strict({ id: NumberFromString });
  type CODEC = InferCodec<typeof codec>;

  const recordCodec = t.strict({
    superId: codec,
  });

  type RECORD_CODEC = InferRecordCodec<typeof recordCodec>;

  assertType<InferCodec<typeof codec>>({
    encode: ({ id }) => ({ id: id.toString() }),
    decode: (_) => E.right({ id: 1 }),
    name: 'NumberFromString',
  });

  assertType<decodeType<RECORD_CODEC>>(E.right({ id: 1 }));

  assertType<decodeType<RECORD_CODEC>>(E.right({ id: 1, superId: { id: 1 } }));

  assertType<serializedType<CODEC>>({ id: '1' });

  assertType<serializedType<RECORD_CODEC>>({ superId: { id: '1' } });

  assertType<runtimeType<CODEC>>({ id: 1 });

  assertType<runtimeType<RECORD_CODEC>>({ superId: { id: 1 } });

  assertType<RecordCodecSerialized<RECORD_CODEC>>({ superId: { id: '1' } });
});
