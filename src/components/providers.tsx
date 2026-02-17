"use client";

import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import { apolloClient } from "@/lib/apollo-client";
import { system } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider value={system}>
        <AuthProvider>{children}</AuthProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}
