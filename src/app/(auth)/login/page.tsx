"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  AlertRoot,
  AlertIndicator,
  AlertTitle,
} from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { LOGIN } from "@/graphql/mutations/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [login, { loading }] = useMutation<{ login: { token: string; user: unknown } }>(LOGIN);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const { data, errors } = await login({
        variables: { input: { email, password } },
      });
      if (errors?.length) {
        const msg = errors[0]?.message ?? "Invalid email or password";
        setErrorMessage(msg);
        toaster.create({ title: msg, type: "error" });
        return;
      }
      const token = data?.login?.token;
      const user = data?.login?.user;
      if (token && user) {
        localStorage.setItem("cca_token", token);
        toaster.create({ title: "Signed in successfully", type: "success" });
        window.location.href = "/dashboard";
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(message);
      toaster.create({ title: message, type: "error" });
    }
  }

  return (
    <Box minH="100vh" bg="bgDark" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <VStack gap={6} as="form" onSubmit={handleSubmit}>
          <Heading size="xl" color="gold" fontFamily="serif">
            Cameroon Chess Academy
          </Heading>
          <Text color="goldLight">Sign in to your account</Text>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>Email</Text>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="bgCard"
              borderColor="goldDark"
              color="white"
              _placeholder={{ color: "whiteAlpha.500" }}
            />
          </Box>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>Password</Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              bg="bgCard"
              borderColor="goldDark"
              color="white"
              _placeholder={{ color: "whiteAlpha.500" }}
            />
          </Box>
          {errorMessage && (
            <AlertRoot status="error" w="full">
              <AlertIndicator />
              <AlertTitle>{errorMessage}</AlertTitle>
            </AlertRoot>
          )}
          <Button type="submit" w="full" bg="gold" color="black" loading={loading} _hover={{ bg: "goldLight" }}>
            Sign In
          </Button>
          <Text color="whiteAlpha.700">
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--gold)" }}>
              Register
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
