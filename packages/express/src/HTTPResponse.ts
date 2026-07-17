export interface HTTPResponse<T> {
  body: T;
  statusCode: number;
  headers?: Record<string, string>;
}

export interface HTTPStreamResponse {
  stream: NodeJS.ReadableStream;
  statusCode: number;
  headers?: Record<string, string>;
}

export interface ResponseError {
  statusCode: number;
  message?: string;
  body?: unknown;
}
