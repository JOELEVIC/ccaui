"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  AlertRoot,
  AlertIndicator,
  AlertTitle,
} from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { LOGIN } from "@/graphql/mutations/auth";

export interface LoginFormProps {
  onSuccess?: (token: string) => void;
  compact?: boolean;
}

export function LoginForm({ onSuccess, compact = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [login, { loading }] = useMutation<{ login: { token: string; user: unknown } }>(LOGIN);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const { data, error } = await login({
        variables: { input: { email, password } },
      });
      if (error) {
        const msg = error.message || "Invalid email or password";
        setErrorMessage(msg);
        toaster.create({ title: msg, type: "error" });
        return;
      }
      const token = data?.login?.token;
      const user = data?.login?.user;
      if (token && user) {
        if (onSuccess) {
          onSuccess(token);
        } else {
          localStorage.setItem("cca_token", token);
          toaster.create({ title: "Signed in successfully", type: "success" });
          window.location.href = "/dashboard";
        }
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(message);
      toaster.create({ title: message, type: "error" });
    }
  }

  return (
    <VStack gap={compact ? 4 : 6} as="form" onSubmit={handleSubmit} align="stretch" w="full">
      {!compact && (
        <Text color="gold" fontSize="sm" fontWeight="500">
          Sign in to your account
        </Text>
      )}
      <Box w="full">
        <Text as="label" display="block" color="whiteAlpha.900" mb={1} fontSize="sm">
          Email
        </Text>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          bg="bgCard"
          borderColor="whiteAlpha.12"
          color="white"
          size={compact ? "sm" : "md"}
          _placeholder={{ color: "whiteAlpha.500" }}
        />
      </Box>
      <Box w="full">
        <Text as="label" display="block" color="whiteAlpha.900" mb={1} fontSize="sm">
          Password
        </Text>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          bg="bgCard"
          borderColor="whiteAlpha.12"
          color="white"
          size={compact ? "sm" : "md"}
          _placeholder={{ color: "whiteAlpha.500" }}
        />
      </Box>
      {errorMessage && (
        <AlertRoot status="error" w="full" size="sm">
          <AlertIndicator />
          <AlertTitle>{errorMessage}</AlertTitle>
        </AlertRoot>
      )}
      <Button
        type="submit"
        w="full"
        bg="gold"
        color="black"
        size={compact ? "sm" : "md"}
        loading={loading}
        _hover={{ bg: "goldLight" }}
        borderRadius="soft"
      >
        Sign In
      </Button>
      <Text color="whiteAlpha.700" fontSize="sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--chakra-colors-gold)" }}>
          Register
        </Link>
      </Text>
    </VStack>
  );
}
