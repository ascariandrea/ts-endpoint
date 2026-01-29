import { type TaskEither } from 'fp-ts/lib/TaskEither.js';

export const throwTE = async <E, A>(te: TaskEither<E, A>): Promise<A> => {
  return te().then((rr) => {
    if (rr._tag === 'Left') {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(rr.left);
    }
    return Promise.resolve(rr.right);
  });
};
