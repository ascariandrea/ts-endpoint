import { Schema } from 'effect';
import { some } from 'effect/Option';
import { assertType, describe, test } from 'vitest';
import {
  type Codec,
  type EncodedType,
  type RecordEncoded,
  type RecordSerialized,
  type runtimeType,
  type SerializedType,
  type serializedType,
} from '../Codec.js';

describe('Codec', () => {
  test('Schema.String satisfies Codec<string, string>', () => {
    const stringCodec = Schema.String;
    assertType<Codec<string, string>>(stringCodec);

    assertType<Codec<number, number>>(Schema.Number);
    const numberFromStringCodec = Schema.NumberFromString;
    assertType<Codec<number, string>>(numberFromStringCodec);

    const structCodec = Schema.Struct({
      id: Schema.NumberFromString,
      name: Schema.String,
    });

    assertType<Codec<{ id: number; name: string }, { id: string; name: string }>>(structCodec);

    const structRecordCodec = Schema.Struct({
      id: Schema.NumberFromString,
      name: Schema.String,
    });

    const optionSchema = Schema.OptionFromNullishOr(Schema.Number, null);

    // serialized type helpers
    assertType<serializedType<typeof Schema.NumberFromString>>('1');
    assertType<RecordSerialized<(typeof structCodec)['fields']>>({ id: '1', name: 'name' });
    assertType<SerializedType<typeof Schema.NumberFromString>>('1');
    assertType<SerializedType<typeof structRecordCodec>>({ id: '1', name: 'name' });

    assertType<RecordEncoded<(typeof structCodec)['fields']>>({ id: 1, name: 'name' });

    assertType<EncodedType<typeof structCodec>>({ id: 1, name: 'name' });
    assertType<EncodedType<typeof structRecordCodec>>({ id: 1, name: 'name' });
    assertType<EncodedType<typeof optionSchema>>(some(1));

    // runtime type helpers
    assertType<runtimeType<typeof optionSchema>>(some(1));
    assertType<runtimeType<typeof Schema.NumberFromString>>(1);
  });
});
