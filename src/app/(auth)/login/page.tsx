"use client";

import { Box, Container, Heading } from "@chakra-ui/react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Box minH="100vh" bg="bgDark" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <Heading size="xl" color="gold" fontFamily="serif" mb={6} textAlign="center">
          Cameroon Chess Academy
        </Heading>
        <LoginForm />
      </Container>
    </Box>
  );
}
