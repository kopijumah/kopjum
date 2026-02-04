'use client';

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return (
    <NuqsAdapter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </NuqsAdapter>
  );
}
