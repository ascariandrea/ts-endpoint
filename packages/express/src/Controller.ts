import { type TaskEither } from 'fp-ts/lib/TaskEither.js';
import { type HTTPResponse, type HTTPStreamResponse } from './HTTPResponse.js';

export type Controller<E, P, H, Q, B, R, IsStream extends boolean | undefined = undefined> = (
  args: { params: P; headers: H; query: Q; body: B },
  req: Express.Request,
  res: Express.Response
) => TaskEither<E, IsStream extends true ? HTTPStreamResponse : HTTPResponse<R>>;
