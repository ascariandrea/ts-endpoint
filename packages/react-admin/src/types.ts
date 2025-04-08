import {
  type Codec,
  type EndpointInstance,
  type EndpointOutputType,
  type EndpointParamsType,
  type EndpointQueryType,
  type EndpointsMapType,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type IOError,
  type MinimalEndpointInstance,
  type PartialSerializedType,
  type ResourceEndpoints,
  type runtimeType,
  type serializedType,
} from '@ts-endpoint/core';
import type * as TE from 'fp-ts/lib/TaskEither.js';
import type { DeleteParams, GetListParams } from 'react-admin';
import { type APIRESTClient } from './ApiRestClient.js';

export type GetListFnParamsE<L> = Partial<Omit<GetListParams, 'filter'>> & {
  filter?: Partial<
    serializedType<
      L extends MinimalEndpointInstance
        ? InferEndpointInstanceParams<L>['query']
        : InferEndpointParams<L>['query']
    >
  >;
};

export type CreateFnParams<C> = InferEndpointParams<C>['body'] extends undefined
  ? undefined
  : runtimeType<InferEndpointParams<C>['body']>;

export type EditFnParams<C> = Partial<runtimeType<InferEndpointParams<C>['body']>> &
  runtimeType<InferEndpointParams<C>['params']>;

export type EndpointDataOutputType<L> = L extends MinimalEndpointInstance
  ? InferEndpointInstanceParams<L>['output'] extends Codec<any, any>
    ? runtimeType<InferEndpointInstanceParams<L>['output']>['data'] extends unknown[]
      ? runtimeType<InferEndpointInstanceParams<L>['output']>
      : runtimeType<InferEndpointInstanceParams<L>['output']>['data']
    : never
  : InferEndpointParams<L>['output'] extends Codec<any, any>
    ? runtimeType<InferEndpointParams<L>['output']>['data'] extends unknown[]
      ? runtimeType<InferEndpointParams<L>['output']>
      : runtimeType<InferEndpointParams<L>['output']>['data']
    : never;

export type GetFn<G> = (
  params: EndpointParamsType<G>,
  query?: PartialSerializedType<InferEndpointInstanceParams<G>['query']>
) => TE.TaskEither<IOError, EndpointDataOutputType<G>>;

type GetListFnParams<L, O = undefined> = O extends undefined
  ? Omit<GetListParams, 'filter'> & { filter: Partial<EndpointQueryType<L>> }
  : O;

export type GetListFn<L, O = undefined> = (
  params: GetListFnParams<L, O>
) => TE.TaskEither<IOError, EndpointOutputType<L>>;

type CreateFn<C> = (params: CreateFnParams<C>) => TE.TaskEither<IOError, EndpointDataOutputType<C>>;

type EditFn<C> = (params: EditFnParams<C>) => TE.TaskEither<IOError, EndpointDataOutputType<C>>;

type DeleteFn<C> = (params: DeleteParams<any>) => TE.TaskEither<IOError, EndpointDataOutputType<C>>;

type CustomEndpointParams<C> = (InferEndpointInstanceParams<C>['headers'] extends Codec<any>
  ? {
      Headers: serializedType<InferEndpointInstanceParams<C>['headers']>;
    }
  : Record<string, unknown>) &
  (InferEndpointInstanceParams<C>['body'] extends undefined
    ? Record<string, unknown>
    : {
        Body: serializedType<InferEndpointInstanceParams<C>['body']>;
      });

export type CustomEndpointFn<C extends MinimalEndpointInstance> = (
  params: CustomEndpointParams<C>,
  q?: any
) => TE.TaskEither<IOError, runtimeType<InferEndpointInstanceParams<C>['output']>>;

export type CustomEndpointsRecord<CC> =
  CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: CustomEndpointFn<CC[K]>;
      }
    : never;

export interface ResourceEndpointREST<G, L, C, E, D, CC> {
  get: GetFn<G>;
  getList: GetListFn<L>;
  post: CreateFn<C>;
  edit: EditFn<E>;
  delete: DeleteFn<D>;
  Custom: CustomEndpointsRecord<CC>;
}

export type ResourceRESTEndpoints<E> =
  E extends ResourceEndpoints<
    EndpointInstance<infer G>,
    EndpointInstance<infer L>,
    EndpointInstance<infer C>,
    EndpointInstance<infer E>,
    EndpointInstance<infer D>,
    infer CC extends Record<string, MinimalEndpointInstance>
  >
    ? ResourceEndpointREST<
        EndpointInstance<G>,
        EndpointInstance<L>,
        EndpointInstance<C>,
        EndpointInstance<E>,
        EndpointInstance<D>,
        CC
      >
    : never;

export interface EndpointsRESTClient<ES extends EndpointsMapType> {
  Endpoints: {
    [K in keyof ES]: ResourceRESTEndpoints<ES[K]>;
  };
  client: APIRESTClient;
}
