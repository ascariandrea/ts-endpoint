import * as React from 'react';
import { QueryProvider } from './tanstack-query-client';

export const TanstackQueryOutput: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, isError, error } = QueryProvider.Actor.Custom.GetByName.useQuery(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {JSON.stringify(error, null, 2)}</div>;
  }

  return <code>{JSON.stringify(data, null, 2)}</code>;
};
