"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Center, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (token && !user && !loading) {
      // Token exists but me not loaded yet - wait a bit
      return;
    }
  }, [token, user, loading, router]);

  if (!loading && !token) {
    return null;
  }

  if (loading) {
    return (
      <Center minH="100vh" bg="bgDark">
        <VStack gap={4}>
          <Spinner size="xl" color="gold" />
          <Text color="gold">Loading...</Text>
        </VStack>
      </Center>
    );
  }

  return <>{children}</>;
}
