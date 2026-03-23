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
  /** Gold sign-in screen styling */
  chessPro?: boolean;
}

export function LoginForm({ onSuccess, compact = false, chessPro = false }: LoginFormProps) {
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
      {!compact && !chessPro && (
        <Text color="gold" fontSize="sm" fontWeight="500">
          Sign in to your account
        </Text>
      )}
      <Box w="full">
        <Text as="label" display="block" color={chessPro ? "bgDark" : "whiteAlpha.900"} mb={1} fontSize="sm" fontWeight="500">
          {chessPro ? "Email" : "Email"}
        </Text>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          bg={chessPro ? "whiteAlpha.800" : "bgCard"}
          borderColor={chessPro ? "blackAlpha.100" : "whiteAlpha.12"}
          color={chessPro ? "bgDark" : "white"}
          size={compact ? "sm" : "md"}
          _placeholder={{ color: chessPro ? "blackAlpha.400" : "whiteAlpha.500" }}
        />
      </Box>
      <Box w="full">
        <Text as="label" display="block" color={chessPro ? "bgDark" : "whiteAlpha.900"} mb={1} fontSize="sm" fontWeight="500">
          Password
        </Text>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          bg={chessPro ? "whiteAlpha.800" : "bgCard"}
          borderColor={chessPro ? "blackAlpha.100" : "whiteAlpha.12"}
          color={chessPro ? "bgDark" : "white"}
          size={compact ? "sm" : "md"}
          _placeholder={{ color: chessPro ? "blackAlpha.400" : "whiteAlpha.500" }}
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
        bg={chessPro ? "bgDark" : "gold"}
        color={chessPro ? "gold" : "black"}
        size={compact ? "sm" : "md"}
        loading={loading}
        _hover={{ bg: chessPro ? "#1a2238" : undefined }}
        borderRadius="soft"
      >
        Sign in
      </Button>
      {!chessPro && (
        <Text color="whiteAlpha.700" fontSize="sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--chakra-colors-gold)" }}>
            Register
          </Link>
        </Text>
      )}
      {chessPro && (
        <Text color="bgDark" fontSize="sm" textAlign="center" opacity={0.85}>
          <Link href="/register" style={{ fontWeight: 600, textDecoration: "underline" }}>
            Don&apos;t have an account? Register
          </Link>
        </Text>
      )}
    </VStack>
  );
}
