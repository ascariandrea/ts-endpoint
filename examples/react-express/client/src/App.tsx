import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InferFetchResult } from '@ts-endpoint/http-client';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as React from 'react';
import { apiClient } from './api';
import { TanstackQueryOutput } from './TanstackQueryOutput';

type APIResult = InferFetchResult<typeof apiClient.getUser>;

const App: React.FC = () => {
  const [userID, setUserID] = React.useState<O.Option<string>>(O.none);
  const [loading, setLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState<O.Option<string>>(O.none);
  const [response, setResponse] = React.useState<O.Option<APIResult>>(O.none);
  const [streaming, setStreaming] = React.useState(false);
  const [streamChunks, setStreamChunks] = React.useState<string[]>([]);
  const streamAbortRef = React.useRef<AbortController | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        margin: 'auto',
      }}
    >
      <h2 style={{ textAlign: 'center', marginTop: '80px' }}>ts-endpoint hello world</h2>
      <span style={{ marginBottom: '40px' }}>
        This app displays the a very basic usage for the{' '}
        <a href="https://www.npmjs.com/package/ts-endpoint">ts-endpoint</a> package. Try fetching
        user data (only users 1 and 2 are in DB).
      </span>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            placeholder="user ID"
            style={{ marginRight: '5px' }}
            type="string"
            value={O.isNone(userID) ? '' : userID.value}
            onChange={(e) => setUserID(e.target.value === '' ? O.none : O.some(e.target.value))}
          />

          <button
            disabled={loading}
            onClick={() => {
              pipe(
                userID,
                O.fold(
                  () => setValidationError(O.some('you must set a userID to fetch data!')),
                  (ID) => {
                    setValidationError(O.none);
                    setLoading(true);
                    apiClient
                      .getUser({ Params: { id: ID } })()
                      .then((response) => {
                        setResponse(O.some(response));
                        setLoading(false);
                      });
                  }
                )
              );
            }}
          >
            {loading ? 'loading....' : 'get data!'}
          </button>
        </div>

        {O.isSome(validationError) ? (
          <span style={{ color: 'red' }}>{validationError.value}</span>
        ) : null}
      </div>

      <div style={{ height: '100%' }}>
        <h3 style={{ textAlign: 'center' }}>Responses:</h3>
        <div>
        {pipe(
            response,
            O.fold(
              () => <span>there is no data to show yet!</span>,
              E.fold(
                (error) => {
                  return (
                    <div>{`There was a problem fetching data: ${
                      error.details.kind === 'DecodingError' ? error.message : error.message
                    }`}</div>
                  );
                },
                (result) => (
                  <>
                    <div
                      style={{ marginBottom: '40px' }}
                    >{`you successfully fetched ${result.user.name}'s data!`}</div>
                    <div>
                      <div>
                        <strong>name: </strong>
                        {result.user.name}
                      </div>
                      <div>
                        <strong>age: </strong>
                        {result.user.age}
                      </div>
                      <div>
                        <strong>surname: </strong>
                        {result.user.surname}
                      </div>
                    </div>
                  </>
                )
              )
            )
          )}
        </div>
        {pipe(
          userID,
          O.fold(
            () => <span>there is no data to show yet!</span>,
            (ID) => <TanstackQueryOutput id={ID} />
          )
        )}
        <div style={{ marginTop: 30 }}>
          <h3>Stream demo</h3>
          <div style={{ marginBottom: 8 }}>
            <button
              disabled={streaming}
              onClick={async () => {
                setStreamChunks([]);
                setStreaming(true);
                const controller = new AbortController();
                streamAbortRef.current = controller;

                try {
                  const result = await apiClient.streamUsers()();
                  if (E.isLeft(result)) {
                    // handle error by stopping stream
                    setStreaming(false);
                    streamAbortRef.current = null;
                    return;
                  }

                  const stream = result.right as any;

                  // Web ReadableStream
                  if (stream && typeof stream.getReader === 'function') {
                    const reader = stream.getReader();
                    const decoder = new TextDecoder();

                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        setStreamChunks((c) => [...c, chunk]);
                      }
                    }
                  } else if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
                    // Async-iterable (Node stream with async iterator)
                    const decoder = new TextDecoder();
                    for await (const chunk of stream) {
                      const s = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
                      setStreamChunks((c) => [...c, s]);
                    }
                  } else if (stream && typeof stream.on === 'function') {
                    // Node-style stream events
                    const decoder = new TextDecoder();
                    await new Promise<void>((resolve) => {
                      stream.on('data', (chunk: any) => {
                        const s = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
                        setStreamChunks((c) => [...c, s]);
                      });
                      stream.on('end', () => resolve());
                      stream.on('close', () => resolve());
                    });
                  }
                } catch (e) {
                  // abort or network error
                } finally {
                  setStreaming(false);
                  streamAbortRef.current = null;
                }
              }}
            >
              {streaming ? 'streaming...' : 'Start stream demo'}
            </button>

            <button
              style={{ marginLeft: 8 }}
              disabled={!streaming}
              onClick={() => {
                streamAbortRef.current?.abort();
              }}
            >
              Stop
            </button>
          </div>

          <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ddd', padding: 8 }}>
            {streamChunks.length === 0 ? <em>No stream data yet</em> : streamChunks.join('')}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContainer: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default AppContainer;
