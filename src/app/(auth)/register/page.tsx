"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { REGISTER } from "@/graphql/mutations/auth";
import type { UserRole } from "@/lib/auth";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "COACH", label: "Coach" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "SCHOOL_ADMIN", label: "School Admin" },
  { value: "REGIONAL_ADMIN", label: "Regional Admin" },
  { value: "NATIONAL_ADMIN", label: "National Admin" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerMutation, { loading }] = useMutation<{ register: { token: string; user: unknown } }>(REGISTER);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            email,
            username,
            password,
            role,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          },
        },
      });
      const token = data?.register?.token;
      if (token) {
        localStorage.setItem("cca_token", token);
        toaster.create({ title: "Account created. Welcome!", type: "success" });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toaster.create({ title: message, type: "error" });
    }
  }

  return (
    <Box minH="100vh" bg="bgDark" py={12}>
      <Container maxW="md">
        <VStack gap={4} as="form" onSubmit={handleSubmit}>
          <Heading size="xl" color="gold" fontFamily="serif">
            Create Account
          </Heading>
          <Text color="goldLight">Join DChessAcademy</Text>
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
            />
          </Box>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>Username</Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              bg="bgCard"
              borderColor="goldDark"
              color="white"
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
            />
          </Box>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>Role</Text>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#1A1A1A",
                border: "1px solid #B8962E",
                color: "white",
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Box>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>First name (optional)</Text>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              bg="bgCard"
              borderColor="goldDark"
              color="white"
            />
          </Box>
          <Box w="full">
            <Text as="label" display="block" color="whiteAlpha.900" mb={2}>Last name (optional)</Text>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              bg="bgCard"
              borderColor="goldDark"
              color="white"
            />
          </Box>
          <Button type="submit" w="full" bg="gold" color="black" loading={loading} _hover={{ bg: "goldLight" }}>
            Register
          </Button>
          <Text color="whiteAlpha.700">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--gold)" }}>
              Sign in
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
