import { IOError, IOTSCodec } from '@ts-endpoint/core';
import { GetEndpointSubscriber } from '@ts-endpoint/express';
import express from 'express';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import * as TA from 'fp-ts/TaskEither';
import { getUser } from 'shared';

const database = [
  { id: 1, name: 'John', surname: 'Doe', age: 22 },
  { id: 2, name: 'Michael', surname: 'Black', age: 51 },
];

function getUserFromDB(id: number) {
  return TA.fromEither(E.fromNullable('user not found')(database.find((u) => u.id === id)));
}

const app = express();

const router = express.Router();

const registerRouter = GetEndpointSubscriber({
  buildDecodeError: (errors) => {
    return new IOError('error decoding args', {
      kind: 'DecodingError',
      errors: [errors],
    });
  },
  decode: (type) => (input) => {
    const typeAsCodec = type as IOTSCodec<any, any>;
    return pipe(
      typeAsCodec.decode(input),
      E.mapLeft(
        (e) =>
          new IOError(`Failed to decode type ${typeAsCodec.name}`, {
            kind: 'ClientError',
            status: '400',
            meta: e,
          })
      )
    );
  },
});
const AddEndpoint = registerRouter(router);

AddEndpoint(getUser, ({ params: { id } }) => {
  const user = getUserFromDB(id);

  return pipe(
    user,
    TA.mapLeft(
      (e) => new IOError('user not found.', { kind: 'ClientError', status: '404', meta: e })
    ),
    TA.map((userFromDB) => ({
      body: { user: userFromDB },
      statusCode: 200,
    }))
  );
});

app.use(router);

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
