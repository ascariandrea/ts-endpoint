import { Endpoint } from '@ts-endpoint/core';
import * as t from 'io-ts';
import { NumberFromString } from 'io-ts-types/lib/NumberFromString.js';

const User = t.strict({
  name: t.string,
  surname: t.string,
  age: t.number,
});

export const getUser = Endpoint({
  Method: 'GET',
  getPath: ({ id }) => `user/${id}`,
  Output: t.strict({ user: User }),
  Input: {
    Params: t.type({ id: NumberFromString }),
  },
});


