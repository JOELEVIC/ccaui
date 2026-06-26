"use client";

import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import { apolloClient } from "@/lib/apollo-client";
import { system } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { ServerWarmup } from "@/components/system/ServerWarmup";
import { PlacementGate } from "@/components/placement/PlacementGate";
import { GlobalHaptics } from "@/components/common/GlobalHaptics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider value={system}>
        <AuthProvider>
          <ServerWarmup />
          <GlobalHaptics />
          {children}
          {/* App-wide: shows the placement modal on any page once a logged-in
              user needs placement (the component self-gates on auth + status). */}
          <PlacementGate />
        </AuthProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}
