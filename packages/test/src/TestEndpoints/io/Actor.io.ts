import { Schema } from 'effect';

export const Actor = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  avatar: Schema.Struct({
    id: Schema.String,
    url: Schema.String,
    createdAt: Schema.Date,
    updatedAt: Schema.Date,
  }).annotations({ title: 'Avatar' }),
  bornOn: Schema.Union(Schema.Null, Schema.Date),
  diedOn: Schema.Union(Schema.Null, Schema.Date),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}).annotations({ title: 'Actor' });

export type Actor = typeof Actor.Type;
