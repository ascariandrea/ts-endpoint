import { EffectCodec, IOError, IOTSCodec } from '@ts-endpoint/core';
import { GetEndpointSubscriber } from '@ts-endpoint/express';
import { Actor, TestEndpoints } from '@ts-endpoint/test';
import { Arbitrary, Schema } from 'effect';
import express, { NextFunction, Request, Response } from 'express';
import * as fc from 'fast-check';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/pipeable.js';
import * as TA from 'fp-ts/lib/TaskEither.js';
import { getUser } from 'shared';

const database = [
  { id: 1, name: 'John', surname: 'Doe', age: 22 },
  { id: 2, name: 'Michael', surname: 'Black', age: 51 },
];

function getUserFromDB(id: number) {
  return TA.fromEither(E.fromNullable('user not found')(database.find((u) => u.id === id)));
}


const actors = fc.sample(Arbitrary.make(Actor))


function getActorFromDB(id: string) {
  return TA.fromEither(E.fromNullable('actor not found')(actors.find((u) => u.id === id)));
}


const app = express();

const router = express.Router();

const registerRouter = GetEndpointSubscriber({
  buildDecodeError: (errors) => {
    console.error(errors);
    return new IOError('Decoding error', {
      kind: 'DecodingError',
      errors: [errors],
    });
  },
  decode: (type: IOTSCodec<any, any>) => (input: unknown) => {
    return pipe(
      type.decode(input),
      E.mapLeft(
        (e) =>
          new IOError(`Failed to decode type ${type.name}`, {
            kind: 'ClientError',
            status: '400',
            meta: e,
          })
      )
    );
  },
});

const registerRouterEffect = GetEndpointSubscriber({
  buildDecodeError: (errors) => {
    console.error(errors);
    return new IOError('Failed to decode with Effect', {
      kind: 'DecodingError',
      errors: [errors],
    });
  },
  decode: (type: EffectCodec<any, any>) => (input: unknown) => {
    return pipe(
      input,
      Schema.decodeUnknownEither(type as Schema.Schema<any>),
      E.mapLeft(
        (e) =>
          new IOError(`Failed to decode type ${type}`, {
            kind: 'DecodingError',
            errors: [e],
          })
      )
    );
  },
});
const AddEndpointIOTS = registerRouter(router);
const AddEndpointEffect = registerRouterEffect(router);

AddEndpointIOTS(getUser, ({ params: { id } }) => {
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

AddEndpointEffect(TestEndpoints.Actor.Get, ({ params: { id } }) => {
  const user = getActorFromDB(id);

  return pipe(
    user,
    TA.mapLeft(
      (e) => new IOError('user not found.', { kind: 'ClientError', status: '404', meta: e })
    ),
    TA.map((userFromDB) => ({
      body: { data: userFromDB },
      statusCode: 200,
    }))
  );
});

AddEndpointEffect(TestEndpoints.Actor.List, () => {
  return TA.right({
    body: { data: actors, total: database.length },
    statusCode: 200,
  });
});


app.use(router);

app.use((
  err: IOError<any>,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  console.error(err);
  if (err.details.kind === 'DecodingError') {
    _res.status(400).send({
      message: err.message,
      errors: err.details.errors,
    });
    return;
  }

  next(err);
})

const port = 3001;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
