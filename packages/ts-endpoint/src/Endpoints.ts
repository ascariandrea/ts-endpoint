
import { MinimalEndpointInstance } from './Endpoint';
import { ResourceEndpoints } from './ResourceEndpoint';

export type EndpointsMapType = Record<
  string,
  ResourceEndpoints<
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    Record<string, MinimalEndpointInstance>
  >
>;

type Endpoints<ES extends EndpointsMapType> = {
  [K in keyof ES]: ES[K];
};

const Endpoints = <ES extends EndpointsMapType>(es: ES): Endpoints<ES> => es;

export { Endpoints };
